import {Router} from "express";
import {errorAPIHandler} from "../../error";
import {middlewareAuthenticationToken} from "../../middleware/middleware-authentication-token";
import {middlewareCheckUserProject} from "../../middleware/middleware-check-user-project";
import {inspectContainerDockerService} from "../../controller/docker/container/container-inspect";
import {switchContainerController} from "../../controller/docker/container/container-switch";
import {logContainerController} from "../../controller/docker/container/container-log";
import {runContainerController} from "../../controller/docker/container/container-run";
import {attachContainerController} from "../../controller/docker/container/container-attach";


export const containerDockerRouter = Router()

// Container
containerDockerRouter.get('/inspect', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareCheckUserProject,
    inspectContainerDockerService
))

containerDockerRouter.post('/switch/:state', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareCheckUserProject,
    switchContainerController
))

containerDockerRouter.get('/log', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareCheckUserProject,
    logContainerController
))

containerDockerRouter.post('/run', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareCheckUserProject,
    runContainerController
))

containerDockerRouter.post('/attach', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareCheckUserProject,
    attachContainerController
))