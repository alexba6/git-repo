import express, {NextFunction, Request, Response} from 'express'
import { json } from 'body-parser'

import {headerApiMiddleware} from "../middleware/header-api";

import {repoRouter} from "../router/repo";
import {authRouter} from "../router/auth";
import {projectRouter} from "../router/project";
import {containerDockerRouter} from "../router/docker/docker-container";
import {environmentDockerRouter} from "../router/docker/docker-environment";
import {userRouter} from "../router/user";

export const serverApi = express()

serverApi.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.method,  req.url)
    next()
})

serverApi.use('/api', headerApiMiddleware)
serverApi.use('/api', json())

serverApi.use('/api/auth', authRouter)
serverApi.use('/api/user', userRouter)
serverApi.use('/api/project', projectRouter)
serverApi.use('/api/docker/container', containerDockerRouter)
serverApi.use('/api/docker/environment', environmentDockerRouter)

serverApi.use('/repos', repoRouter)