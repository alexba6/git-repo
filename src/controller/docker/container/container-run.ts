import {Request, Response} from "express";
import {CheckUserProjectLocalsResponse} from "../../../middleware/middleware-check-user-project";
import {DockerImageManager} from "../../../services/docker/docker-image-manager";
import {Context} from "../../../model/project";
import {getLastCommitId} from "../../../tools/git";
import {ContainerState, DockerContainerManager} from "../../../services/docker/docker-container-manager";
import { ProjectError } from "../../../error/error-project";

/**
 *
 * @param req
 * @param res
 */
export const runContainerController = async (req: Request, res: Response<any, CheckUserProjectLocalsResponse>) => {
    const { project } = res.locals
    const commitId = req.query.commitId as string || await getLastCommitId(project.projectPath.repository)

    if (!commitId) {
        throw new ProjectError('COMMIT_NOT_FOUND')
    }

    const dockerOptions = project.dockerOptions

    if (dockerOptions.test.enable) {
        res.write('BUILD TEST')
        const testImage = new DockerImageManager(project, commitId, Context.TEST)
        await testImage.build((msg) => res.write(msg))
        const testContainer = new DockerContainerManager(project, Context.TEST)
        res.write('RUN TEST')
        await testContainer.create(testImage.name)
        await testContainer.switchState(ContainerState.START)
        await testContainer.getLog(true, (msg) => res.write(msg))
        await testContainer.switchState(ContainerState.STOP)
        await testContainer.remove()
        await testImage.remove()
    }
    res.write('BUILD PRODUCTION')
    const buildImage = new DockerImageManager(project, commitId, Context.PRODUCTION)
    await buildImage.build((msg) => res.write(msg))
    const productionContainer = new DockerContainerManager(project, Context.PRODUCTION)
    try {
        await productionContainer.switchState(ContainerState.STOP)
        await productionContainer.remove()
    }
    catch (e) {}
    res.write('RUN PRODUCTION\n')
    res.write('Create container\n')
    await productionContainer.create(buildImage.name)
    res.write('Start new container\n')
    await productionContainer.switchState(ContainerState.START)
    res.write('OK\n')
    res.end()
}