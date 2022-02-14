import { Project } from "../../model/project"
import { runProcess } from "../../tools/process";
import path from "path";
import { spawn } from "child_process";
import colors from "colors";

export type EnvironmentArray = [string, string | number | boolean | null]

export type DockerActionParams = {
    trackBranchName: string,
    production: {
        environment: EnvironmentArray[]
    },
    test: {
        enable: boolean,
        environment: EnvironmentArray[]
    }
}

export enum EnvironmentContext {
    PRODUCTION='PRODUCTION',
    TEST='TEST'
}

export class DockerAction {
    private settings: DockerActionParams

    public project: Project
    public commitId: string

    /**
     * @param project
     * @param settings
     * @param commitId
     */
    constructor(project: Project, settings: DockerActionParams, commitId: string) {
        this.settings = settings
        this.project = project
        this.commitId = commitId
    }

    /**
     * @param project
     */
    static async getHEADCommitId(project: Project) {
        const outRows: string = await runProcess('git', ['rev-parse', 'HEAD'], { cwd: project.projectPath.repository })
        return outRows.split('\n')[0]
    }

    /**
     * @param context
     */
    getImageName(context: EnvironmentContext) {
        return `${this.project.id}/${this.commitId}/${String(context).toLowerCase()}`
    }

    /**
     * @param context
     */
    getContainerName(context: EnvironmentContext) {
        return `${this.project.id}-${String(context).toLowerCase()}`
    }

    /**
     * @param sendMessage
     */
    async runContainer(sendMessage: (msg: string) => void) {
        const startTimer = new Date()
        sendMessage(colors.cyan('DOCKER ACTIONS'))
        sendMessage(colors.blue('RESET CODE'))
        await this.reset()
        const test = this.settings.test
        if (test.enable) {
            sendMessage(colors.blue('BUILD TEST IMAGE'))
            await this.build(EnvironmentContext.TEST, sendMessage)
            sendMessage(colors.blue('TEST APPLICATION'))
            await this.test(sendMessage)
        }
        sendMessage(colors.blue('BUILD PRODUCTION IMAGE'))
        await this.build(EnvironmentContext.PRODUCTION, sendMessage)
        sendMessage(colors.blue('RESTART CONTAINER'))
        const offTimeEndpoint = new Date()
        await this.restart(sendMessage)
        const endTimer = new Date()
        const buildTime = Math.floor((endTimer.getTime() - startTimer.getTime()) / 100) / 10
        const offTime = Math.floor((endTimer.getTime() - offTimeEndpoint.getTime()) / 100) / 10
        sendMessage(colors.red(`off time ${offTime}s`))
        sendMessage(colors.blue('DONE ') + colors.gray(`( in ${buildTime}s)`))
    }

    async reset() {
        const { docker } = this.project.projectPath
        await runProcess('git', ['stash'], { cwd: docker })
        await runProcess('git', ['fetch', '--all'], { cwd: docker })
        await runProcess('git', ['reset', '--hard', this.commitId], { cwd: docker })
    }

    /**
     * @param onMessage
     */
    async test(onMessage: (message: string) => void) {
        const containerName = this.getContainerName(EnvironmentContext.TEST)
        await runProcess('docker', ['stop', containerName])
        await runProcess('docker', ['rm', containerName])
        const testArgs = ['run','--name', containerName, this.getImageName(EnvironmentContext.TEST)]
        const testPs = spawn('docker', testArgs, { })

        let passed = true

        const onData = (chunk: Buffer) => {
            const chunkRows = chunk.toString('ascii').split('\n')
            for (const chunkRow of chunkRows) {
                if (chunkRow.toLowerCase().match(/failed/)) {
                    passed = false
                }
                if (chunkRow.length > 0) {
                    onMessage(chunkRow)
                }
            }
        }

        testPs.stdout.on('data', onData)
        testPs.stderr.on('data', onData)

        return new Promise<void>((resolve, reject) => {
            testPs.on('close', () => {
                if (passed) {
                    resolve()
                    return
                }
                reject(new Error('Test not passed !'))
            })
            testPs.stdout.on('error', reject)
        })
    }

    /**
     * @param context
     * @param onMessage
     */
    async build(context: EnvironmentContext, onMessage: (message: string) => void) {
        if (!path.join(this.project.projectPath.docker, 'Dockerfile')) {
            throw new Error('Docker file not found !')
        }
        const buildArgs = ['build', '--no-cache', '-t', this.getImageName(context), '--target', String(context).toLowerCase(), '.']
        const buildPs = spawn('docker', buildArgs, { cwd: this.project.projectPath.docker })

        buildPs.stdout.on('data', (chunk: Buffer) => {
            const chunkRows = chunk.toString('ascii').split('\n')
            for (const chunkRow of chunkRows) {
                if (chunkRow.length > 1) {
                    const msg = chunkRow.match(/Step ([0-9]*)\/([0-9]*)/) ? colors.green(chunkRow) : chunkRow
                    onMessage(msg)
                }
            }
        })

        return new Promise<any>((resolve, reject) => {
            buildPs.stdout.on('close', resolve)
            buildPs.on('error', reject)
        })
    }

    /**
     * @param onMessage
     */
    async restart(onMessage: (message: string) => void) {
        const containerName = this.getContainerName(EnvironmentContext.PRODUCTION)
        onMessage('Stopping old container')
        await runProcess('docker', ['stop', containerName])
        onMessage('Removing old container')
        await runProcess('docker', ['rm', containerName])
        onMessage('Start new container')
        const runArgs = ['run','-it','-d','--name', containerName, this.getImageName(EnvironmentContext.PRODUCTION)]
        await runProcess('docker', runArgs)
    }
}