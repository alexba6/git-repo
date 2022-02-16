import {Request, Response} from 'express'
import {Context, EnvironmentArray, Project} from '../../../model/project';
import joi from "joi";
import {CheckUserProjectLocalsResponse} from "../../../middleware/middleware-check-user-project";
import {getRepository} from "typeorm";

type DeleteEnvSettingsDockerServiceBody = {
    environmentContext: Context,
    deleteEnvironmentKey: string[]
}

export const deleteEnvSettingsDockerServiceBodySchema = joi.object({
    environmentContext: joi.string().required().allow('PRODUCTION', 'TEST', 'production', 'test'),
    deleteEnvironmentKey: joi.array().items(joi.string())
})

/**
 * @param req
 * @param res
 */
export const deleteEnvSettingsDockerServiceController = async (req: Request<any, any, DeleteEnvSettingsDockerServiceBody>, res: Response<any, CheckUserProjectLocalsResponse>) => {
    const { deleteEnvironmentKey, environmentContext } = req.body
    const { project } = res.locals

    const newEnvironment: EnvironmentArray[] = project
        .getEnvironment(environmentContext)
        .filter(([key]: EnvironmentArray) => deleteEnvironmentKey.indexOf(key) === -1)

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
