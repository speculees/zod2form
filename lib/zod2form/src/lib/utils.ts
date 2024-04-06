import * as z from 'zod';

export function isZodString(element: z.ZodTypeAny): element is z.ZodString {
    return element._def.typeName === 'ZodString';
}

export function isZodNumber(element: z.ZodTypeAny): element is z.ZodNumber {
    return element._def.typeName === 'ZodNumber';
}

export function isZodBoolean(element: z.ZodTypeAny): element is z.ZodBoolean {
    return element._def.typeName === 'ZodBoolean';
}

export function isZodLiteral(element: z.ZodTypeAny): element is z.ZodLiteral<z.ZodTypeAny> {
    return element._def.typeName === 'ZodLiteral';
}

export function isZodUnion(element: z.ZodTypeAny): element is z.ZodUnion<never> {
    return element._def.typeName === 'ZodUnion';
}

export function isZodObject(element: z.ZodTypeAny): element is z.ZodObject<z.ZodRawShape> {
    return element._def.typeName === 'ZodObject';
}

export function isZodDefault(element: z.ZodTypeAny): element is z.ZodDefault<z.ZodTypeAny> {
   return element._def.typeName === 'ZodDefault'; 
}

export function peel(any: z.ZodTypeAny, callback?: (any: z.ZodTypeAny) => void) {
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
