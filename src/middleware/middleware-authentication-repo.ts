import {
    Request,
    Response,
    NextFunction
} from 'express'

import {User} from "../model/user";
import {Project} from "../model/project";
import {getRepository} from "typeorm";
import {AuthRepoError} from "../error/error-auth-repo";

export type AuthenticationRepoLocalsResponse = {
    user: User,
    project: Project
}

/**
 * Check authentication by key
 * @param req
 * @param res
 * @param next
 */
export const middlewareAuthenticationRepo = async (req: Request, res: Response<any, AuthenticationRepoLocalsResponse>, next: NextFunction) => {
    const authorization = req.headers['authorization']

    if (!authorization) {
        throw new AuthRepoError('MUST_BASIC_AUTH')
    }

    const [type, token] = authorization.split(' ')

    if (type.toLocaleLowerCase() !== 'basic') {
        throw new AuthRepoError('MUST_BASIC_AUTH')
    }

    const buffer = Buffer.from(token, 'base64')
    const [login, password] = buffer.toString('utf8').split(':')

    const user = await getRepository(User).findOne({
        where: [
            { email: login },
            { username: login }
        ]
    })

    if (!user) {
        throw new AuthRepoError('INVALID_LOGIN')
    }

    if (!await user.isValidPassword(password)) {
        throw new AuthRepoError('INVALID_PASSWORD')
    }

    const repoName = req.params.repoName

    const project = await getRepository(Project).findOne({
        where: { owner: user, name: repoName }
    })

    if (!project) {
        throw new AuthRepoError('PROJECT_NOT_FOUND')
    }

    res.locals = { user, project }
    next()
}
