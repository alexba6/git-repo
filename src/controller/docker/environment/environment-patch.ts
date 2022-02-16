import {Request, Response} from 'express'
import {CheckUserProjectLocalsResponse} from "../../../middleware/middleware-check-user-project";
import joi from "joi";
import {Context, EnvironmentArray, Project} from "../../../model/project";
import {getRepository} from "typeorm";

type PatchEnvSettingsDockerServiceBody = {
    environmentContext: Context,
    updatedEnvironment: EnvironmentArray[]
}

export const patchEnvSettingsDockerServiceBodySchema = joi.object({
    environmentContext: joi.string().required().allow('PRODUCTION', 'TEST', 'production', 'test'),
    updatedEnvironment: joi.array()
        .items(joi.array().items(joi.string(), joi.any()))
})

/**
 * @param req
 * @param res
 */
export const patchEnvSettingsDockerServiceController = async (req: Request<any, any, PatchEnvSettingsDockerServiceBody>, res: Response<any, CheckUserProjectLocalsResponse>) => {
    const { updatedEnvironment, environmentContext } = req.body
    const { project } = res.locals

    const updatedEnvironmentKeys = updatedEnvironment.map(([key]: EnvironmentArray) => key)


    const newEnvironment: EnvironmentArray[] = [
        ...project
            .getEnvironment(environmentContext)
            .filter(([key]: EnvironmentArray) => updatedEnvironmentKeys.indexOf(key) === -1),
        ...updatedEnvironment
    ]

    project.setEnvironment(environmentContext, newEnvironment)

    await getRepository(Project).save(project)

    res.status(200).json({
        projectId: project.id,
        environment: {
            context: environmentContext,
            environment: project.getEnvironment(environmentContext)
        }
    })
}
