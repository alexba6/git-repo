import { Router } from 'express'
import {errorAPIHandler} from "../error";
import {middlewareAuthenticationToken} from "../middleware/middleware-authentication-token";
import {addProjectBodySchema, addProjectController} from "../controller/project/project-add";
import {middlewareSchemaBody} from "../middleware/middleware-schema";

export const projectROuter = Router()

projectROuter.post('/', errorAPIHandler(
    middlewareAuthenticationToken,
    middlewareSchemaBody(addProjectBodySchema),
    addProjectController
))