import { Router } from 'express'
import {errorAPIHandler} from "../error";
import {middlewareAuthenticationToken} from "../middleware/middleware-authentication-token";
import {getUserInfoController} from "../controller/user/user-info";

export const userRouter = Router()

userRouter.get('/', errorAPIHandler(
    middlewareAuthenticationToken,
    getUserInfoController
))