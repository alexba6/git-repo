import {Request, Response} from "express";
import {CheckUserProjectLocalsResponse} from "../../../middleware/middleware-check-user-project";
import {DockerContainerManager} from "../../../services/docker/docker-container-manager";

/**
 * @param req
 * @param res
 */
export const inspectContainerDockerService = async (req: Request, res: Response<any, CheckUserProjectLocalsResponse>) => {
    const { project } = res.locals

    const containerManager = new DockerContainerManager(project)

    const containerInspect = await containerManager.inspect()

    res.status(200).json({
        projectId: project.id,
        container: {
            Id: containerInspect.Id,
            CreatedAt: containerInspect.Created,
            Args: containerInspect.Args,
            State: containerInspect.State,
            Image: containerInspect.Image
        }
    })
}