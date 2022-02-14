import { Request, Response } from 'express'
import {getRepository} from "typeorm";
import jwt from "jsonwebtoken";
import joi from "joi";

import {User} from "../../model/user";
import {UserError} from "../../error/user";
import {JWT_KEY} from "../../config/jwt";

type LoginAuthenticationBody = {
    login: User['username'] | User['email'],
    password: string
}

export const loginAuthenticationBodySchema = joi.object({
    login: joi.string().required(),
    password: joi.string().required()
})

/**
 * @param req
 * @param res
 */
export const loginAuthenticationController = async (req: Request<any, any, LoginAuthenticationBody>, res: Response) => {
    const { login, password } = req.body
    const user = await getRepository(User).findOne({
        where: [
            { email: login },
            { username: login }
        ]
    })

    if (!user) {
        throw new UserError('USER_NOT_FOUND')
    }

    await user.verifyPassword(password)

    const tokenPayload = {
        userId: user.id,
        ip: req.ip,
        createAt: new Date().toISOString()
    }

    res.status(200).json({
        token: jwt.sign(tokenPayload, JWT_KEY, { expiresIn: '1w' })
    })
}