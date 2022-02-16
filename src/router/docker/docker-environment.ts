import {Router} from "express";
import {errorAPIHandler} from "../../error";
import {middlewareAuthenticationToken} from "../../middleware/middleware-authentication-token";
import {middlewareCheckUserProject} from "../../middleware/middleware-check-user-project";
import {middlewareSchemaBody} from "../../middleware/middleware-schema";

import {
    patchEnvSettingsDockerServiceBodySchema,
    patchEnvSettingsDockerServiceController
} from "../../controller/docker/environment/environment-patch";
import {
    deleteEnvSettingsDockerServiceBodySchema,
    deleteEnvSettingsDockerServiceController
} from "../../controller/docker/environment/environment-delete";


export const environmentDockerRouter = Router()

// Environment
environmentDockerRouter.patch('/', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareCheckUserProject,
    middlewareSchemaBody(patchEnvSettingsDockerServiceBodySchema),
    patchEnvSettingsDockerServiceController
))

environmentDockerRouter.delete('/', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareCheckUserProject,
    middlewareSchemaBody(deleteEnvSettingsDockerServiceBodySchema),
    deleteEnvSettingsDockerServiceController
))
