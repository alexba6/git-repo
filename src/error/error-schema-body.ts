import { ValidationErrorItem} from 'joi'
import {APIError} from "./index";


export class SchemaBodyError extends APIError<any> {
    /**
     * Schema body error
     * @param details
     */
    constructor(details: ValidationErrorItem[]) {
        super('INVALID_BODY_SCHEMA', {
            statusCode: 400,
            items: {
                field: details.map(detail =>({
                    message: detail.message,
                    path: detail.path
                }))
            }
        })
    }

}