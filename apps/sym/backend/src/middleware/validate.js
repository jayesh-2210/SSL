/**
 * Express middleware factory for Zod request validation.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            return next(result.error);
        }
        req[source] = result.data;
        next();
    };
}
