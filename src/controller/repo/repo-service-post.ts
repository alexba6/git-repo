import {Request, Response} from 'express'
import {AuthenticationRepoLocalsResponse} from "../../middleware/middleware-authentication-repo";
import {END_PUSH_HEX_DATA, getLastCommitId, packSideband} from "../../tools/git";
import {spawn} from "child_process";
import util from "util";
import {DockerImageManager} from "../../services/docker/docker-image-manager";
import {runProcess} from "../../tools/process";
import {ContainerState, DockerContainerManager} from "../../services/docker/docker-container-manager";
import {Context} from "../../model/project";

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
            const dockerOptions = project.dockerOptions
            if (dockerOptions.git.autoBuild) {
                try {
                    const commitId = await getLastCommitId(project.projectPath.repository)
                    if (commitId) {
                        if (dockerOptions.test.enable) {
                            res.write(pushRemoteMessage('BUILD TEST'))
                            const testImage = new DockerImageManager(project, commitId, Context.TEST)
                            await testImage.build(msg => {
                                res.write(pushRemoteMessage(msg))
                            })
                            const testContainer = new DockerContainerManager(project, Context.TEST)
                            res.write(pushRemoteMessage('RUN TEST'))
                            await testContainer.create(testImage.name)
                            await testContainer.switchState(ContainerState.START)
                            await testContainer.getLog(true, log => {
                                res.write(pushRemoteMessage(log))
                            })
                            await testContainer.switchState(ContainerState.STOP)
                            await testContainer.remove()
                            await testImage.remove()
                        }
                        res.write(pushRemoteMessage('BUILD PRODUCTION'))
                        const buildImage = new DockerImageManager(project, commitId, Context.PRODUCTION)
                        await buildImage.build(msg => {
                            res.write(pushRemoteMessage(msg))
                        })
                        const productionContainer = new DockerContainerManager(project, Context.PRODUCTION)
                        try {
                            await productionContainer.switchState(ContainerState.STOP)
                            await productionContainer.remove()
                        }
                        catch (e) {}
                        res.write(pushRemoteMessage('RUN PRODUCTION'))
                        await productionContainer.create(buildImage.name)
                        await productionContainer.switchState(ContainerState.START)
                    }
                }
                catch (e) {
                    res.write(pushRemoteMessage(e))
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