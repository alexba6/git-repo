import { Request, Response } from 'express'
import {AuthenticationRepoLocalsResponse} from "../../middleware/middleware-authentication-repo";
import {END_PUSH_HEX_DATA, packSideband} from "../../tools/git";
import {spawn} from "child_process";
import util from "util";
import colors from 'colors'
import { DockerAction } from '../../actions/docker';

const pushRemoteMessage = (message: string): Buffer => {
    const _log = util.format(message)
    const SIDEBAND = String.fromCharCode(2)
    return Buffer.from(packSideband(`${SIDEBAND}${_log}\n`))
}


/**
 * @param req
 * @param res
 */
export const postServiceRepoController = async (req: Request, res: Response<any, AuthenticationRepoLocalsResponse>) => {
    const { project } = res.locals
    const { service } = req.params

    res.setHeader('content-type', 'application/x-' + service + '-result')
    res.setHeader('expires', 'Fri, 01 Jan 1980 00:00:00 GMT')
    res.setHeader('pragma', 'no-cache')
    res.setHeader('cache-control', 'no-cache, max-age=0, must-revalidate')

    const ps = spawn(service, ['--stateless-rpc', project.projectPath.repository])

    req.on('data', (data: Buffer) => ps.stdin.write(data))

    ps.stdout.on('data', (data: Buffer) => {
        const hex = data.toString('hex')
        // Filter the process output during the push to send data before closing connection
        if (service === 'git-receive-pack' &&  END_PUSH_HEX_DATA.indexOf(hex) !== -1) {
            return
        }
        res.write(data)
    })

    ps.stdout.on('error', (e) => {
        console.log(e)
        res.end()
    })

    ps.stdin.on('close', async () => {
        if (service === 'git-receive-pack') {
            const dockerActionParams = project.settings.actions.docker
            if (dockerActionParams) {
                try {
                    const commitId = await DockerAction.getHEADCommitId(project)
                    const dockerAction = new DockerAction(project, dockerActionParams, commitId)
                    await dockerAction.runContainer(message => {
                        res.write(pushRemoteMessage(message))
                    })
                }
                catch (e) {
                    console.log(e)
                    res.write(pushRemoteMessage(colors.red(String(e))))
                }
            }
            for (const hex of END_PUSH_HEX_DATA) {
                res.write(Buffer.from(hex, 'hex'))
            }
            res.end()

        }
        else {
            res.end()
        }
    })
}