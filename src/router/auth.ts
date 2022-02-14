import { Router } from 'express'
import {errorAPIHandler} from "../error";

import {loginAuthenticationBodySchema, loginAuthenticationController} from "../controller/auth/auth-login";
import {middlewareSchemaBody} from "../middleware/middleware-schema";


export const authRouter = Router()

authRouter.post('/login', errorAPIHandler(
    middlewareSchemaBody(loginAuthenticationBodySchema),
    loginAuthenticationController
))