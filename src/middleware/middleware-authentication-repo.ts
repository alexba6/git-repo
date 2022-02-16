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
    const { username, repoName } = req.params

    if (!authorization) {
        throw new AuthRepoError('MUST_BASIC_AUTH')
    }

    const [type, token] = authorization.split(' ')

    if (type.toLocaleLowerCase() !== 'basic') {
        throw new AuthRepoError('MUST_BASIC_AUTH')
    }

    const buffer = Buffer.from(token, 'base64')
    const [login, auth] = buffer.toString('utf8').split(':')

    const user = await getRepository(User).findOne({
        where: [
            { email: login },
            { username: login }
        ]
    })

    if (!user) {
        throw new AuthRepoError('INVALID_LOGIN')
    }

    if (username !== user.username) {
        throw new AuthRepoError('INVALID_REPO_URL')
    }

    if (!await user.isValidPassword(auth)) {
        throw new AuthRepoError('INVALID_PASSWORD')
    }

    const project = await getRepository(Project).findOne({
        where: {
            owner: user,
            name: repoName,
        },
        join: {
            alias: 'project',
            leftJoinAndSelect: {
                owner: 'project.owner'
            }
        }
    })

    if (!project) {
        throw new AuthRepoError('PROJECT_NOT_FOUND')
    }

    res.locals = { user, project }
    next()
}
