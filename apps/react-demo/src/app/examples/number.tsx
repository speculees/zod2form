import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { deriveDefaultValues, deriveInputs } from '@speculees/zod2form';

const schema = z.object({
  type: z.literal(1).readonly(),
  x: z.number().min(3).max(20).optional().describe('X').default(10),
  y: z.number().min(3).max(20).optional().describe('Y').default(0),
});

const defaultValues = deriveDefaultValues(schema);
const inputs = deriveInputs(schema);

const Number: React.FC = () => {
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

export default Number;
