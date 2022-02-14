import { Request, Response } from 'express'
import {AuthenticationTokenLocalsResponse} from "../../middleware/middleware-authentication-token";
import joi from "joi";
import {Project} from "../../model/project";
import { getRepository } from 'typeorm';

type addProjectBody = {
    name: Project['name'],
    tags: Project['tags']
}

export const addProjectBodySchema = joi.object<addProjectBody>({
    name: joi.string().required(),
    tags: joi.array()
})

/**
 * @param req
 * @param res
 */
export const addProjectController = async (req: Request<any, any, addProjectBody>, res: Response<any, AuthenticationTokenLocalsResponse>) => {
    const user = res.locals.user
    const { name, tags } = req.body

    const project = new Project()
    project.name = name
    project.owner = user
    if (tags) {
        project.tags = tags
    }
    await getRepository(Project).save(project)

    await project.initFolder()

    res.status(201).json({
        project: project.info
    })
}