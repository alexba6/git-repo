import {NextFunction, Request, Response} from 'express'
import {User} from "../model/user";
import {Project} from "../model/project";
import {getRepository} from "typeorm";
import { ProjectError } from '../error/error-project';

export type CheckUserProjectLocalsResponse = {
    user: User,
    project: Project
}

export type CheckUserProjectQuery = {
    projectId: Project['id']
}

/**
 * @param req
 * @param res
 * @param next
 */
export const middlewareCheckUserProject = async (req: Request<any, any, any, CheckUserProjectQuery>, res: Response<any, CheckUserProjectLocalsResponse>, next: NextFunction) => {
    const { user } = res.locals
    const { projectId } = req.query

    const project = await getRepository(Project).findOne({
        where: {
            owner: user,
            id: projectId
        },
        relations: ['owner']
    })

    if (!project) {
        throw new ProjectError('PROJECT_NOT_FOUND')
    }

    res.locals.project = project
    next()
}