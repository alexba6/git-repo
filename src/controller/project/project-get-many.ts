import { Request, Response } from 'express'
import {AuthenticationTokenLocalsResponse} from "../../middleware/middleware-authentication-token";
import {Project} from "../../model/project";
import {getRepository} from 'typeorm';
import {FindConditions} from "typeorm/find-options/FindConditions";

type GetListProjectQuery = {
    orderByDate?: 'ASC' | 'DESC'
}

/**
 * @param req
 * @param res
 */
export const getManyProjectController = async (req: Request<any, any, any, GetListProjectQuery>, res: Response<any, AuthenticationTokenLocalsResponse>) => {
    const { user } = res.locals
    const query = req.query

    const where: FindConditions<Project> =  {
        owner: user
    }

    const projects = await getRepository(Project).find({
        where,
        order: {
            createdAt: query.orderByDate ? query.orderByDate : 'DESC'
        }
    })

    return res.status(200).json({
        projects: projects.map(project => project.info)
    })
}