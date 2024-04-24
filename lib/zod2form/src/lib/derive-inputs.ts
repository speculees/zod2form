import * as z from 'zod';
import * as Utils from './utils';

/**
 * Token used to identify hidden inputs.
 * Placed at the start of an description string.
 * Short for 'input hidden'.
 */
export const INPUT_HIDDEN = '_ih_';

export type InputTypeOption = {
    label: string;
    value: string;
};

export type InputType<N = string> = {
    name: N;
    readOnly: boolean;
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
 * // InlineKeys<User> -> 'username' | 'password' | 'location.address' | 'location.zipcode'
 */
export type InlineKeys<T, P extends string = ''> = {
    [K in keyof T]: T[K] extends Record<string, unknown>
        ? InlineKeys<T[K], join<P & string, K & string>>
        : join<P & string, K & string>;
}[keyof T];

/**
 * Make all keys in an object required, recursively.
 * 
 * @example
 * 
 * type User = {
 *   username: string;
 *   location?: {
 *     address?: string;
 *     zipcode?: string;
 *   }
 * }
 * 
 * // RequiredDeep<User> -> {
 * //   username: string;
 * //   location: {
 * //     address: string;
 * //     zipcode: string;
 * //   }
 * // }
 */
export type RequiredDeep<T> = {
    [P in keyof T]-?: T[P] extends Record<string, unknown>
        ? RequiredDeep<Required<T[P]>>
        : Required<T[P]>;
};

/**
 * Concatenate two strings with a dot as a separator.
 *
 * @template A The first string.
 * @template B The second string.
 *
 * @returns The concatenated string. If either of the input strings is empty,
 * the other string is returned. If both input strings are empty, an empty
 * string is returned.
 *
 * @example
 *
 * type Result1 = join<'foo', 'bar'>; // 'foo.bar'
 * type Result2 = join<'', 'bar'>; // 'bar'
 * type Result3 = join<'foo', ''>; // 'foo'
 * type Result4 = join<'' , '' >; // ''
 */
type join<A extends string, B extends string> = A extends '' ? B : B extends '' ? A : `${A}.${B}`;

type InputSchema = z.ZodObject<z.ZodRawShape> | z.ZodReadonly<z.ZodObject<z.ZodRawShape>>;

/**
 * Derives an array of input types from a ZodObject schema.
 *
 * @param {z.ZodObject<T>} schema - The ZodObject schema to derive inputs from.
 * @return {InputType[]} An array of input types derived from the schema.
 */
function deriveInputs<T extends InputSchema>(
    schema: T,
    options: DeriveInputOptions = { outputName: 'inline' }
): InputType<InlineKeys<RequiredDeep<z.infer<T>>>>[] {
    let shape: z.ZodRawShape;
    if (Utils.isZodObject(schema)) {
        shape = schema.shape;
    } else if (Utils.isZodReadonly(schema)) {
        const _object = schema._def.innerType;
        if (Utils.isZodObject(_object)) {
            shape = _object.shape;
        } else throw new Error('Invalid schema');
    } else {
        throw new Error('Invalid schema');
    }

    const inputs: InputType[] = []; 
    const keys = Object.keys(shape);
    const _options = {
        outputName: 'inline',
        object: { description: true, ...options.object },
        ...options
    } as DeriveInputOptions;
    let objReadOnly = false, objHidden = false;
    Utils.peel(schema, (item) =>  { 
        objReadOnly = objReadOnly || Utils.isZodReadonly(item);
        objHidden = objHidden || isHiddenType(item.description);
    });
    updateDividerFromPlaceholder({
        name: '',
        readOnly: objReadOnly,
        placeholder: objHidden ? schema.description?.slice(INPUT_HIDDEN.length) : schema.description,
        type: 'divider'
    }, inputs, _options);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (Object.prototype.hasOwnProperty.call(shape, key)) {
            const input = { name: key, readOnly: objReadOnly } as InputType;
            if (objHidden) input.type = 'hidden';

            const element = Utils.peel(shape[key], (item) => {
                input.readOnly = input.readOnly || objReadOnly || Utils.isZodReadonly(item);
                
                const { description } = item;
                if (description) {
                    const hidden = isHiddenType(description);
                    input.type = input.type === 'hidden' || objHidden || hidden ? 'hidden' : undefined;
                    input.placeholder = hidden ? description.slice(INPUT_HIDDEN.length) : description;
                }
            }) as z.ZodNumber;

            if (input.type === 'hidden') {
                inputs.push(input);
                continue;
            }

            updateFromZodString(element, input);
            updateFromZodNumber(element, input);
            updateFromZodBoolean(element, input);
            updateFromZodUnion(element, input);

            if (Utils.isZodObject(element)) {
                if (_options.outputName === 'inline') {
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

function isHiddenType(description = '') {
    return description.startsWith(INPUT_HIDDEN);
}

function updateDividerFromPlaceholder(input: InputType, inputs: InputType[], options: DeriveInputOptions) {
    const addDescription = options.object?.description !== false && input.placeholder;
    if (addDescription) {
        inputs.push(input);
    }
}

function updateFromZodString(element: z.ZodTypeAny, input: InputType) {
    if (Utils.isZodString(element)) {
        if (element.isURL) {
            input.type = 'url';
        } else if (element.isEmail) {
            input.type = 'email';
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
    const _inputs = deriveInputs(element as never, options);

    for (const _input of _inputs as InputType[]) {
        _input.name = `${input.name}.${_input.name}`;
        inputs.push(_input);
    }
}
