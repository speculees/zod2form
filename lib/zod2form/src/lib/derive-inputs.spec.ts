import * as z from 'zod';
import deriveInputs, { INPUT_HIDDEN } from './derive-inputs';

export const user = {
  type: z.literal('USER'),
  id: z
    .string()
    .uuid()
    .optional()
    .default('123e4567-e89b-12d3-a456-426614174000'),
  firstName: z.string().optional().describe('First Name').default('John'),
  lastName: z.string().optional().default('Doe'),
  userName: z.string().default('johndoe'),
  picture: z.string().url().default('https://i.pravatar.cc/300'),
  email: z.string().email().default('johndoe@me.com'),
  age: z.number().default(25),
  isActive: z.boolean().default(true),
};

export const location = {
  type: z.literal('LOCATION'),
  address: z.string().optional().describe('Address'),
  city: z.string().optional().describe('City'),
  state: z.string().optional().describe('State'),
  country: z.string().optional().describe('Country'),
  zipcode: z.string().optional().describe('Zipcode'),
};

describe('deriveInputs', () => {
  describe('literal', () => {
    it('should derive type text', () => {
      const schema = z.object({ type: z.literal('USER') });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('text');
    });

    it('should derive type number', () => {
      const schema = z.object({ type: z.literal(0) });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('number');
    });

    it('should derive type checkbox', () => {
      const schema = z.object({ type: z.literal(true) });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('checkbox');
    });

    it('should derive type hidden', () => {
      const schema = z.object({ type: z.literal(Symbol('terrific')) });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('hidden');
    });
  });

  describe('readonly', () => {
    it('should apply readonly from object', () => {
      const schema = z
        .object({
          ...user,
          location: z.object({ ...location }),
        })
        .readonly();
      const inputs = deriveInputs(schema);

      for (const input of inputs) {
        // readonly is true when not in location object
        expect(input.readOnly).toEqual(!input.name.includes('location'));
      }
    });

    it('should apply readonly from object props', () => {
      const schema = z.object({
        id: user.id,
        firstName: user.firstName.readonly(),
        lastName: user.lastName.readonly(),
        userName: user.userName,
      });

      const inputs = deriveInputs(schema);

      expect(inputs.shift()?.readOnly).toEqual(false); // id
      expect(inputs.pop()?.readOnly).toEqual(false); // userName

      for (const input of inputs) {
        expect(input.readOnly).toEqual(true);
      }
    });
  });

  describe('string', () => {
    it('should derive type text', () => {
      const { firstName, lastName, userName } = user;
      const schema = z.object({ firstName, lastName, userName });
      const inputs = deriveInputs(schema);
      for (const input of inputs) {
        expect(input.type).toEqual('text');
      }
    });

    it('should derive type email', () => {
      const { email } = user;
      const schema = z.object({ email });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('email');
    });

    it('should derive type url', () => {
      const { picture } = user;
      const schema = z.object({ picture });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('url');
    });

    it('should derive type hidden', () => {
      const schema = z.object({
        cuid: z
          .string()
          .cuid()
          .describe(INPUT_HIDDEN + 'CUID')
          .optional(),
        cuid2: z
          .string()
          .cuid2()
          .optional()
          .describe(INPUT_HIDDEN + 'CUID2'),
        uuid: z
          .string()
          .describe(INPUT_HIDDEN + 'UUID')
          .uuid()
          .optional(),
        ulid: z.string().ulid().optional(),
      });

      const inputs = deriveInputs(schema);

      expect(inputs.pop()?.type).toEqual('text');

      for (const input of inputs) {
        expect(input.type).toEqual('hidden');
      }
    });

    it('should derive type hidden with description in root', () => {
      const schema = z
        .object({
          cuid: z
            .string()
            .cuid()
            .describe(INPUT_HIDDEN + 'CUID')
            .optional(),
          cuid2: z.string().cuid2().optional().describe('CUID2'),
          uuid: z
            .string()
            .describe(INPUT_HIDDEN + 'UUID')
            .uuid()
            .optional(),
          ulid: z.string().ulid().optional(),
          text: z.string(),
          number: z.number(),
        })
        .describe(INPUT_HIDDEN + 'ID');

      const inputs = deriveInputs(schema, { object: { description: false } });
      for (const input of inputs) {
        expect(input.type).toEqual('hidden');
      }
    });
  });

  describe('number', () => {
    it('should derive type number', () => {
      const { age } = user;
      const schema = z.object({ age });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('number');
    });
  });

  describe('boolean', () => {
    it('should derive type checkbox', () => {
      const { isActive } = user;
      const schema = z.object({ isActive });
      const inputs = deriveInputs(schema);
      expect(inputs[0].type).toEqual('checkbox');
    });
  });

  describe('inline', () => {
    test('if number of inputs matches number of properties', () => {
      const userSchema = z.object({ ...user });
      expect(deriveInputs(userSchema).length).toEqual(Object.keys(user).length);

      const locationSchema = z.object({ ...location });
      expect(deriveInputs(locationSchema).length).toEqual(
        Object.keys(location).length
      );
    });

    test('if number of inputs matches number of nested properties', () => {
      const schema = z.object({ ...user, location: z.object({ ...location }) });
      const inputs = deriveInputs(schema);
      expect(inputs.length).toEqual(
        Object.keys(user).length + Object.keys(location).length
      );
    });

    describe('options', () => {
      it('sets divider type', () => {
        const schema = z.object({
          location: z.object({ ...location }).describe('Location'),
        });

        const inputs = deriveInputs(schema);
        expect(inputs[0].type).toEqual('divider');
      });

      it('sets dividers if object description is set', () => {
        const schema = z.object({
          ...user,
          location: z.object({ ...location }).describe('Location'),
        });

        // test default object description
        expect(deriveInputs(schema).length).toEqual(
          Object.keys(user).length + Object.keys(location).length + 1
        );

        // test adding root description
        expect(deriveInputs(schema.describe('User')).length).toEqual(
          Object.keys(user).length + Object.keys(location).length + 2
        );
      });

      it('does not set divider if object description is not set', () => {
        const schema = z.object({
          ...user,
          location: z.object({ ...location }),
        });

        const inputs = deriveInputs(schema);
        expect(inputs.length).toEqual(
          Object.keys(user).length + Object.keys(location).length
        );
      });

      it('dos not set divider if options object description is false', () => {
        const schema = z.object({
          ...user,
          location: z.object({ ...location }).describe('Location'),
        });

        const inputs = deriveInputs(schema, { object: { description: false } });
        expect(inputs.length).toEqual(
          Object.keys(user).length + Object.keys(location).length
        );
      });
    });
  });
});
