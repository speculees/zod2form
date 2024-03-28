import * as z from 'zod';

export type InputTypeOption = {
    label: string;
    value: string;
}

export type InputType = {
    name: string;
    placeholder?: string;
    type?: string;
    options?: InputTypeOption[];
};

export type DeriveInputOptions = {
    outputName?: 'inline' | 'grouped';
}

/**
 * Derives an array of input types from a ZodObject schema.
 *
 * @param {z.ZodObject<T>} schema - The ZodObject schema to derive inputs from.
 * @return {InputType[]} An array of input types derived from the schema.
 */
function deriveInputs<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    options: DeriveInputOptions = { outputName: 'inline' }
) {
    const inputs: InputType[] = []; 
    const keys = Object.keys(schema.shape);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
            const input = { name: key } as InputType;
            const element = peel(schema.shape[key], ({ description }) => {
                if (description) {
                    input.placeholder = description;
                }
            }) as z.ZodNumber;

            updateFromZodString(element, input);
            updateFromZodNumber(element, input);
            updateFromZodBoolean(element, input);
            updateFromZodUnion(element, input);

            if (isZodObject(element)) {
                if (options.outputName === 'inline') {
                    updateFromZodObjectAsInline(element, input, inputs);
                } else if (options.outputName === 'grouped') {
                    throw new Error('Not implemented');
                }

                continue;
            }

            inputs.push(input)
        }
    }

    return inputs;
}

export default deriveInputs;

function updateFromZodString(element: z.ZodTypeAny, input: InputType) {
    if (isZodString(element)) {
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
    if (isZodNumber(element)) {
        input.type = 'number';
    }
}

function updateFromZodBoolean(element: z.ZodTypeAny, input: InputType) {
    if (isZodBoolean(element)) {
        input.type = 'checkbox';
    }
}

function updateFromZodUnion(element: z.ZodTypeAny, input: InputType) {
    if (isZodUnion(element)) {
        const elements = element._def.options as unknown;
        if (Array.isArray(elements)) {
            const options: InputTypeOption[] = [];
            for (const e of elements as z.ZodTypeAny[]) {
                let label; 
                const peeled = peel(e, ({ description }) => {
                    if (description) {
                        label = description;
                    }
                });

                if (isZodLiteral(peeled)) {
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

function updateFromZodObjectAsInline(element: z.ZodObject<z.ZodRawShape>, input: InputType, inputs: InputType[]) {
    const _inputs = deriveInputs(element);

    for (const _input of _inputs) {
        _input.name = `${input.name}.${_input.name}`;
        inputs.push(_input);
    }
}

function peel(any: z.ZodTypeAny, callback?: (any: z.ZodTypeAny) => void) {
    if (callback) {
        callback(any);
    }

    if (isZodUnion(any) || isZodObject(any)) {
        return any;
    } else if (any._def.innerType) {
        return peel(any._def.innerType, callback);
    } else {
        return any;
    }
}

function isZodString(element: z.ZodTypeAny): element is z.ZodString {
    return element._def.typeName === 'ZodString';
}

function isZodNumber(element: z.ZodTypeAny): element is z.ZodNumber {
    return element._def.typeName === 'ZodNumber';
}

function isZodBoolean(element: z.ZodTypeAny): element is z.ZodBoolean {
    return element._def.typeName === 'ZodBoolean';
}

function isZodLiteral(element: z.ZodTypeAny): element is z.ZodLiteral<z.ZodTypeAny> {
    return element._def.typeName === 'ZodLiteral';
}

function isZodUnion(element: z.ZodTypeAny): element is z.ZodUnion<never> {
    return element._def.typeName === 'ZodUnion';
}

function isZodObject(element: z.ZodTypeAny): element is z.ZodObject<z.ZodRawShape> {
    return element._def.typeName === 'ZodObject';
}