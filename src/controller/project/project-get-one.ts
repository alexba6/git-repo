import { Request, Response } from 'express'
import {AuthenticationTokenLocalsResponse} from "../../middleware/middleware-authentication-token";
import {Project} from "../../model/project";
import {getRepository} from 'typeorm';
import {ProjectError} from "../../error/error-project";

/**
 * @param req
 * @param res
 */
export const getOneProjectController = async (req: Request, res: Response<any, AuthenticationTokenLocalsResponse>) => {
    const { user } = res.locals
    const { projectId } = req.params

    const project = await getRepository(Project).findOne({
        where: {
            owner: user,
            id: projectId
        }
    })

    if (!project) {
        throw new ProjectError('PROJECT_NOT_FOUND')
    }

    return res.status(200).json({
        project: project.allInfo
    })
}