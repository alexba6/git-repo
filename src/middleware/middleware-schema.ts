import {
    NextFunction,
    Request,
    Response
} from 'express'
import { ObjectSchema } from 'joi'
import {SchemaBodyError} from "../error/error-schema-body";

/**
 * Request body schema middleware validation
 * @param schema
 */
export const middlewareSchemaBody = (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.validate(req.body)
    if (!result.error) {
        req.body = result.value
        return next()
    }
    throw new SchemaBodyError(result.error.details)
}
