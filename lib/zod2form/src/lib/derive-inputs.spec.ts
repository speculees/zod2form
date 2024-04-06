import * as z from 'zod';
import deriveInputs from './derive-inputs';

export const user = {
    id: z.string().uuid().optional().default('123e4567-e89b-12d3-a456-426614174000'),
    firstName: z.string().optional().describe('First Name').default('John'),
    lastName: z.string().optional().default('Doe'),
    userName: z.string().default('johndoe'),
    picture: z.string().url().default('https://i.pravatar.cc/300'),
    email: z.string().email().default('johndoe@me.com'),
    age: z.number().default(25),
    isActive: z.boolean().default(true),
};

export const location = {
    address: z.string().optional().describe('Address'),
    city: z.string().optional().describe('City'),
    state: z.string().optional().describe('State'),
    country: z.string().optional().describe('Country'),
    zipcode: z.string().optional().describe('Zipcode'),
};

describe('deriveInputs', () => {

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
                cuid: z.string().cuid().optional(),
                cuid2: z.string().cuid2().optional(),
                uuid: z.string().uuid().optional(),
                ulid: z.string().ulid().optional(),
            });
            const inputs = deriveInputs(schema);
            expect(inputs[0].type).toEqual('hidden');
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
    })

    describe('inline', () => {
        test('if number of inputs matches number of properties', () => {
            const userSchema = z.object({ ...user });
            expect(deriveInputs(userSchema).length)
                .toEqual(Object.keys(user).length);

            const locationSchema = z.object({ ...location });
            expect(deriveInputs(locationSchema).length)
                .toEqual(Object.keys(location).length);
        });

        test('if number of inputs matches number of nested properties', () => {
            const schema = z.object({ ...user, location: z.object({ ...location }) });
            const inputs = deriveInputs(schema);
            expect(inputs.length)
                .toEqual(Object.keys(user).length + Object.keys(location).length);
        });
    });
});