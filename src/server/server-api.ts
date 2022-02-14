import express, {NextFunction, Request, Response} from 'express'
import { json } from 'body-parser'

import {headerApiMiddleware} from "../middleware/header-api";

import {repoRouter} from "../router/repo";
import {authRouter} from "../router/auth";
import {projectROuter} from "../router/project";

export const serverApi = express()

serverApi.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.method,  req.url)
    next()
})

serverApi.use('/api', headerApiMiddleware)
serverApi.use('/api', json())

serverApi.use('/api/auth', authRouter)
serverApi.use('/api/project', projectROuter)

serverApi.use('/repos', repoRouter)