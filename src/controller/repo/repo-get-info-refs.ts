import { Request, Response } from 'express'
import {AuthenticationRepoLocalsResponse} from "../../middleware/middleware-authentication-repo";
import {packSideband} from "../../tools/git";
import {spawn} from "child_process";

type GetInfoRefRepoQuery = {
    service: string
}


/**
 * @param req
 * @param res
 */
export const getInfoRefRepoController = async (req: Request<any, any, any, GetInfoRefRepoQuery>, res: Response<any, AuthenticationRepoLocalsResponse>) => {
    const { project } = res.locals
    const { service } = req.query

    res.setHeader('content-type', 'application/x-' + service + '-advertisement')
    res.setHeader('expires', 'Fri, 01 Jan 1980 00:00:00 GMT')
    res.setHeader('pragma', 'no-cache')
    res.setHeader('cache-control', 'no-cache, max-age=0, must-revalidate')

    res.statusCode = 200
    res.write(packSideband('# service=' + service + '\n'))
    res.write('0000')

    const ps = spawn(service, [
        '--stateless-rpc',
        '--advertise-refs',
        project.projectPath.repository
    ])

    ps.stdout.on('data', (buffer: Buffer) => {
        res.write(buffer)
    })

    ps.on('error', (error) => {
        console.log(error)
        res.end()
    })

    ps.on('close', () => {
        res.end()
    })
}