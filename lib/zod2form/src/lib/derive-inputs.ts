import * as z from 'zod';
import * as Utils from './utils';

export type InputTypeOption = {
    label: string;
    value: string;
};

export type InputType<N = string> = {
    name: N;
    placeholder?: string;
    type?: string;
    options?: InputTypeOption[];
};

/**
 * Options for deriving input types from a ZodObject schema.
 */
export type DeriveInputOptions = {
    /**
     * The name of the property on which to output the input types.
     *
     * - `'inline'`: Outputs input types for each property of the schema, in the
     *   order they were defined. If a property has a description, and
     *   `object.description` is not set to `false`, outputs a fieldset with
     *   that description as the legend.
     * - `'grouped'`: Not currently implemented. Outputs input types for each
     *   property of the schema, grouped together in a single fieldset.
     *
     * Defaults to `'inline'`.
     */
    outputName?: 'inline' | 'grouped';
    /**
     * Options for handling object properties (ZodObject).
     */
    object?: {
        /**
         * Whether to include the description of an object property as a
         * fieldset legend when outputting input types for that property. If not
         * set, defaults to `true`. Set to `false` to skip this behavior.
         */
        description?: boolean;
    }
};

/**
 * Traverse an object recursively and map all keys to literals.
 *
 * @example
 * 
 * type User = {
 *   username: string;
 *   password: string;
 *   location: {
 *     address: string;
 *     zipcode: string;
 *   }
 * }
 * 
 * type Keys<T> = keys<T>;
 * // Keys<User> === 'username' | 'password' | 'location.address' | 'location.zipcode'
 */
export type InlineKeys<T, P extends string = ''> = {
    [K in keyof T]: T[K] extends Record<string, unknown>
        ? InlineKeys<T[K], join<P & string, K & string>>
        : join<P & string, K & string>;
}[keyof T];

type join<A extends string, B extends string> = A extends '' ? B : B extends '' ? A : `${A}.${B}`;

/**
 * Derives an array of input types from a ZodObject schema.
 *
 * @param {z.ZodObject<T>} schema - The ZodObject schema to derive inputs from.
 * @return {InputType[]} An array of input types derived from the schema.
 */
function deriveInputs<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    options: DeriveInputOptions = { outputName: 'inline' }
): InputType<InlineKeys<T>>[] {
    const inputs: InputType[] = []; 
    const keys = Object.keys(schema.shape);
    const _options = {outputName: 'inline', ...options } as DeriveInputOptions;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
            const input = { name: key } as InputType;
            const element = Utils.peel(schema.shape[key], ({ description }) => {
                if (description) {
                    input.placeholder = description;
                }
            }) as z.ZodNumber;

            updateFromZodString(element, input);
            updateFromZodNumber(element, input);
            updateFromZodBoolean(element, input);
            updateFromZodUnion(element, input);

            if (Utils.isZodObject(element)) {
                if (_options.outputName === 'inline') {
                    const addDescription = _options.object?.description !== false && element.description;
                    if (addDescription) {
                        inputs.push({ name: key, placeholder: element.description, type: 'divider' } as never);
                    }

                    updateFromZodObjectAsInline(element, input, inputs as never, _options);
                } else if (_options.outputName === 'grouped') {
                    throw new Error('Not implemented');
                }

                continue;
            }

            inputs.push(input);
        }
    }

    return inputs as never;
}

export default deriveInputs;

function updateFromZodString(element: z.ZodTypeAny, input: InputType) {
    if (Utils.isZodString(element)) {
        if (element.isURL) {
            input.type = 'url';
        } else if (element.isEmail) {
            input.type = 'email';
        } else if (element.isCUID
            || element.isCUID2
            || element.isUUID
            || element.isULID
        ) {
            input.type = 'hidden';
        } else {
            input.type = 'text';
        }

    }
}

function updateFromZodNumber(element: z.ZodTypeAny, input: InputType) {
    if (Utils.isZodNumber(element)) {
        input.type = 'number';
    }
}

function updateFromZodBoolean(element: z.ZodTypeAny, input: InputType) {
    if (Utils.isZodBoolean(element)) {
        input.type = 'checkbox';
    }
}

function updateFromZodUnion(element: z.ZodTypeAny, input: InputType) {
    if (Utils.isZodUnion(element)) {
        const elements = element._def.options as unknown;
        if (Array.isArray(elements)) {
            const options: InputTypeOption[] = [];
            for (const e of elements as z.ZodTypeAny[]) {
                let label; 
                const peeled = Utils.peel(e, ({ description }) => {
                    if (description) {
                        label = description;
                    }
                });

                if (Utils.isZodLiteral(peeled)) {
                    options.push({
                        label: label || peeled.value.toString(),
                        value: peeled.value.toString()
                    });
                }
            }

            input.type = 'select';
            input.options = options;
        }
    }
}

function updateFromZodObjectAsInline(element: z.ZodObject<z.ZodRawShape>, input: InputType, inputs: InputType[], options: DeriveInputOptions) {
    const _inputs = deriveInputs(element, options);

    for (const _input of _inputs) {
        _input.name = `${input.name}.${_input.name}`;
        inputs.push(_input);
    }
}
