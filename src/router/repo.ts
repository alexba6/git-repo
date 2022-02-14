import { Router } from 'express'
import { middlewareAuthenticationRepo } from '../middleware/middleware-authentication-repo'
import {errorAPIHandler} from "../error";
import {getInfoRefRepoController} from "../controller/repo/repo-get-info-refs";
import {postServiceRepoController} from "../controller/repo/repo-service-post";

export const repoRouter = Router()

repoRouter.get('/:repoName/info/refs', errorAPIHandler(
    middlewareAuthenticationRepo,
    getInfoRefRepoController
))

repoRouter.post('/:repoName/:service', errorAPIHandler(
    middlewareAuthenticationRepo,
    postServiceRepoController
))