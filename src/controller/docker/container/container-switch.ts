import {Request, Response} from "express";
import {CheckUserProjectLocalsResponse} from "../../../middleware/middleware-check-user-project";
import {ContainerState, DockerContainerManager} from "../../../services/docker/docker-container-manager";
import {ProjectError} from "../../../error/error-project";

/**
 *
 * @param req
 * @param res
 */
export const switchContainerController = async (req: Request, res: Response<any, CheckUserProjectLocalsResponse>) => {
    const { project } = res.locals
    const state = req.params.state as ContainerState

    if (state !== ContainerState.START && state !== ContainerState.STOP && state !== ContainerState.RESTART) {
        throw new ProjectError('INVALID_CONTAINER_STATE')
    }

    const containerManager = new DockerContainerManager(project)

    await containerManager.switchState(state)

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