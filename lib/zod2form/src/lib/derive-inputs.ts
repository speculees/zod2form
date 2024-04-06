import * as z from 'zod';
import * as Utils from './utils';

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

function updateFromZodObjectAsInline(element: z.ZodObject<z.ZodRawShape>, input: InputType, inputs: InputType[]) {
    const _inputs = deriveInputs(element);

    for (const _input of _inputs) {
        _input.name = `${input.name}.${_input.name}`;
        inputs.push(_input);
    }
}
