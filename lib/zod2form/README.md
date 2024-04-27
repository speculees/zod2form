# zod2form lib

Zod2form is a library that helps you to create a form from a zod schema. This first version is meant to be used with [react-hook-form](https://react-hook-form.com).

## Features

- Create a form from a zod schema
- Create default values from a zod schema

## Usage

### React Hook Form

```ts
import { z } from "zod";
import { useForm } from "react-hook-form";
import { deriveDefaultValues, deriveInputs } from "@speculees/zod2form";

const schema = z.object({
    name: z.string().min(3).max(20).optional().describe('Name').default('John'),
    age: z.number().min(18).describe('Age').default(25),
});

const defaultValues = deriveDefaultValues(schema);
const inputs = deriveInputs(schema);

const Form: React.FC = () => {
    const { register, handleSubmit } = useForm({ defaultValues }); 
    const handleFormSubmit = handleSubmit(data => console.log(data));

    return (
        <form onSubmit={handleFormSubmit}>
            {inputs.map(input => (
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
}
```

### Deriving default values from a zod schema

In the above example, the default values are derived from the zod schema using the `deriveDefaultValues` function. The default values object must respect the zod schema. In the above example the output object is `{ name: 'John', age: 25 }`.

### Deriving inputs from a zod schema

The inputs are derived from the zod schema using the `deriveInputs` function. The output of the function is an array of objects with the following properties: `name`, `readOnly`, `placeholder`, `type`.

In the above example, the inputs are:

```ts
[
    { name: 'name', readOnly: false, placeholder: 'Name', type: 'text' },
    { name: 'age', readOnly: false, placeholder: 'Age', type: 'number' } 
]
```

#### Name

Name inputs are derived from the zod schema. The name property comes from the field name in the zod schema. If there are nested fields, the name is concatenated with the nested field name. Example: `location.street` is derived from the `street` field in the `location` object.

#### Readonly

Readonly inputs are derived from the zod schema. Use the `readonly()` method to create a readonly zod schema.

#### Placeholder

Placeholder inputs are derived from the zod schema. Use the `describe()` method to create a placeholder zod schema.

#### Hidden

Hidden inputs are derived from the description string. Use the token `_ih_` to identify hidden inputs.

Example: `describe('_ih_Name')`.

#### Type

Type inputs are derived from the zod schema. Use the `number()` method to create a number input field type, or `string()` to create a text input field type. Use the `optional()` method to create an optional object parameters.

## Installation

Run `npm install @speculees/zod2form` to install the library.

## Building

Run `nx build zod2form` to build the library.

## Running unit tests

Run `nx test zod2form` to execute the unit tests via [Jest](https://jestjs.io).

## Contributing

This project welcomes contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT license.

## Authors

- speculees <speculees@gmail.com>
