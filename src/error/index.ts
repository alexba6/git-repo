import { Request, Response, NextFunction, RequestHandler } from 'express'
import {JsonWebTokenError} from "jsonwebtoken";
import {DEBUG} from "../config/env";


export type ApiErrorParams = {
    json?: boolean,
    headers?: { [key in keyof any]: string },
    items?: any,
    statusCode?: number
}


export class APIError <E extends string> extends Error {
    private readonly responseItems: any
    private readonly headers?: { [key in keyof any]: string }
    private readonly statusCode: number
    private readonly json: boolean
    public error: E

    /**
     *
     * @param error
     * @param params
     */
    constructor(error: E, params: ApiErrorParams) {
        super(error)
        this.error = error
        this.json = params.json !== undefined ? params.json : true
        this.responseItems = params.items
        this.headers = params.headers
        this.statusCode = params.statusCode ? params.statusCode : 400
    }

    sendResponse(res: Response) {
        res.statusCode = this.statusCode
        if (this.headers) {
            for (const [name, value] of Object.entries(this.headers)) {
                res.setHeader(name, value)
            }
        }
        if (this.json) {
            res.json({
                error: this.error,
                ...this.responseItems
            })
        }
        else {
            res.send(this.error)
        }
    }
}


/**
 * Error capture handler
 * @param handlers
 */
export const errorAPIHandler = (...handlers: RequestHandler<any, any, any, any, any>[]): RequestHandler[] => {
    const handlerWithErrorCapture: RequestHandler[] = []
    for (const handler of handlers) {
        handlerWithErrorCapture.push(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                await handler(req, res, next)
            }
            catch (e) {
                if (DEBUG) {
                    console.error(e)
                }
                if (e instanceof APIError) {
                    e.sendResponse(res)
                    return
                }
                if (e instanceof JsonWebTokenError) {
                    res.status(400).json({
                        error: e.message.toUpperCase().split(' ').join('_')
                    })
                    return
                }
                res.status(500).json({
                    error: 'Something goes wrong !'
                })
            }
        })
    }
    return handlerWithErrorCapture
}