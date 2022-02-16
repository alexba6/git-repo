import { Request, Response } from 'express'
import {AuthenticationTokenLocalsResponse} from "../../middleware/middleware-authentication-token";
import joi from "joi";
import {Project} from "../../model/project";
import { getRepository } from 'typeorm';
import { ProjectError } from '../../error/error-project';

type AddProjectBody = {
    name: Project['name'],
    tags: Project['tags']
}

export const addProjectBodySchema = joi.object<AddProjectBody>({
    name: joi.string().required(),
    tags: joi.array()
})

/**
 * @param req
 * @param res
 */
export const addProjectController = async (req: Request<any, any, AddProjectBody>, res: Response<any, AuthenticationTokenLocalsResponse>) => {
    const user = res.locals.user
    const { name, tags } = req.body

    const projectRepository = getRepository(Project)

    const count = await projectRepository.count({
        where: {
            owner: user
        }
    })

    if (count >= user.maxProject) {
        throw new ProjectError('MAX_PROJECT_COUNT')
    }

    const findByName = await projectRepository.findOne({
        where: {
            owner: user,
            name: name
        }
    })

    if (findByName) {
        throw new ProjectError('NAME_ALREADY_TAKEN')
    }

    const project = new Project()
    project.name = name
    project.owner = user
    if (tags) {
        project.tags = tags
    }
    await projectRepository.save(project)

    await project.initFolder()

    res.status(201).json({
        project: project.info
    })
}