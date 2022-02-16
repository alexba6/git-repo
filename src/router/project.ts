import { Router } from 'express'
import {errorAPIHandler} from "../error";
import {middlewareAuthenticationToken} from "../middleware/middleware-authentication-token";
import {addProjectBodySchema, addProjectController} from "../controller/project/project-add";
import {middlewareSchemaBody} from "../middleware/middleware-schema";
import {getManyProjectController} from "../controller/project/project-get-many";
import {getOneProjectController} from "../controller/project/project-get-one";

export const projectRouter = Router()

projectRouter.post('/', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareSchemaBody(addProjectBodySchema),
    addProjectController
))

projectRouter.get('/', errorAPIHandler(
    middlewareAuthenticationToken,
    getManyProjectController
))

projectRouter.get('/:projectId', errorAPIHandler(
    middlewareAuthenticationToken,
    getOneProjectController
))