import {Request, Response} from "express";
import {CheckUserProjectLocalsResponse} from "../../../middleware/middleware-check-user-project";
import {DockerImageManager} from "../../../services/docker/docker-image-manager";
import {Context} from "../../../model/project";
import {getLastCommitId} from "../../../tools/git";
import {ContainerState, DockerContainerManager} from "../../../services/docker/docker-container-manager";
import { ProjectError } from "../../../error/error-project";

/**
 *
 * @param req
 * @param res
 */
export const attachContainerController = async (req: Request, res: Response<any, CheckUserProjectLocalsResponse>) => {
    const { project, user } = res.locals

    const productionContainer = new DockerContainerManager(project, Context.PRODUCTION)


    res.write(`Hello ${user.username} you are attach to ${project.name} !\n`)
    productionContainer.attach(req, res)
}