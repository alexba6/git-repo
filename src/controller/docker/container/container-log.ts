import {Request, Response} from "express";
import {CheckUserProjectLocalsResponse} from "../../../middleware/middleware-check-user-project";
import { DockerContainerManager } from "../../../services/docker/docker-container-manager";

/**
 *
 * @param req
 * @param res
 */
export const logContainerController = async (req: Request, res: Response<any, CheckUserProjectLocalsResponse>) => {
    const { project } = res.locals

    const containerManager = new DockerContainerManager(project)

    containerManager.log((log: string) => {
        res.write(log)
    })
}