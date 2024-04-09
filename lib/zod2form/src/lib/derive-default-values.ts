import * as z from 'zod';
import * as Utils from './utils';

function deriveDefaultValues<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    let defaultValue: unknown;
    const defaultValues: Record<string, unknown> = {};
    const keys = Object.keys(schema.shape);

    for (const key of keys) {
        const element = Utils.peel(schema.shape[key], (el) => {
            if (Utils.isZodDefault(el)) {
                defaultValue = el._def.defaultValue();
            }
        }) as z.ZodNumber;        

        if (Utils.isZodNumber(element)) {
            defaultValues[key] = defaultValue ?? 0;
        }

        if (Utils.isZodString(element)) {
            defaultValues[key] = defaultValue ?? '';
        }

        if (Utils.isZodBoolean(element)) {
            defaultValues[key] = defaultValue ?? false;
        }

        if (Utils.isZodObject(element)) {
            defaultValues[key] = deriveDefaultValues(element);
        }

    }

    return defaultValues as T;
}

export default deriveDefaultValues;