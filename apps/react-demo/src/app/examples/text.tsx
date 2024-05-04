import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { deriveDefaultValues, deriveInputs } from '@speculees/zod2form';

const schema = z.object({
  type: z.literal('USER').readonly(),
  firstName: z.string().min(3).max(20).optional().describe('First Name').default('John'),
  lastName: z.string().min(3).max(20).optional().describe('Last Name').default('Doe'),
});

const defaultValues = deriveDefaultValues(schema);
const inputs = deriveInputs(schema);

const Text: React.FC = () => {
  const { register, handleSubmit } = useForm({ defaultValues });
  const handleFormSubmit = handleSubmit((data) => console.log(data));

  return (
    <form onSubmit={handleFormSubmit}>
      {inputs.map((input) => (
        <input
          key={input.name}
          readOnly={input.readOnly}
          placeholder={input.placeholder}
          type={input.type}
          {...register(input.name)}
        />
      ))}

      <button type="submit" children="Submit" />
    </form>
  );
};

export default Text;
