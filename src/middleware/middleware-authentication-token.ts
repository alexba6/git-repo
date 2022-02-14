import {
    Request,
    Response,
    NextFunction
} from 'express'
import { getRepository } from 'typeorm'
import jwt from 'jsonwebtoken'
import joi from 'joi'

import {User} from "../model/user";
import {JWT_KEY} from "../config/jwt";
import {UserError} from "../error/user";
import {AuthErrorUser} from "../error/error-auth-user";

export type AuthenticationTokenLocalsResponse = {
    user: User
}

type AuthorizationToken = {
    userId: User['id'],
    ip: string,
    createdAt: string
}

/**
 * Check authentication by key
 * @param req
 * @param res
 * @param next
 */
export const middlewareAuthenticationToken = async (req: Request, res: Response<any, AuthenticationTokenLocalsResponse>, next: NextFunction) => {
    const authorisation: any = req.headers['authorization']

    if (!authorisation) {
        throw new AuthErrorUser('INVALID_TOKEN')
    }

    const token = authorisation.split(' ')[1]

    const rawPayload = jwt.verify(token, JWT_KEY)

    const schema = joi.object<AuthorizationToken>({
        userId: joi.string().required(),
        ip: joi.string().required(),
        createdAt: joi.string().required()
    })

    const validate = schema.validate(rawPayload)

    if (!validate.value || validate.value.ip !== req.ip) {
        throw new AuthErrorUser('INVALID_TOKEN')
    }

    const user = await getRepository(User).findOne({ where: { id: validate.value.userId }})

    if (!user) {
        throw new UserError('USER_NOT_FOUND')
    }

    res.locals.user = user
    return next()
}
