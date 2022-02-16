import http, { RequestOptions } from "http";
import path from "path";
import {SpawnOptionsWithoutStdio} from "child_process";
import {createReadStream, createWriteStream} from "fs";
import compressing from 'compressing'

import {Context, Project} from "../../model/project";
import {createTempFolder} from "../../tools/file";
import {runProcess} from "../../tools/process";
import {DOCKER_SOCK} from "../../config/docker";
import fsp from "fs/promises";

export class DockerImageManager {
    public project: Project
    public commitId: string
    public context: Context

    /**
     * @param project
     * @param commitId
     * @param context
     */
    constructor(project: Project, commitId: string, context: Context) {
        this.project = project
        this.commitId = commitId
        this.context = context
    }

    get name() {
        return `${this.project.id}/${this.commitId}:${this.context}`
    }

    get target() {
        const options = this.project.dockerOptions
        return this.context === Context.PRODUCTION ? options.production.target : options.test.target
    }

    /**
     * @param onMessage
     */
    async build(onMessage?: (msg: string) => void) {
        const { tempPath, deleteFolder } = await createTempFolder()
        const repositoryPath = this.project.projectPath.repository

        const processOptions: SpawnOptionsWithoutStdio = {
            cwd: tempPath
        }

        await runProcess('git', ['clone', repositoryPath], processOptions)
        await runProcess('git', ['reset', '--hard', this.commitId], processOptions)

        const tempRepoPath = path.join(tempPath, 'repo')

        const compressingStream = new compressing.tar.Stream()

        for (const itemPath of await fsp.readdir(path.join(tempPath, 'repo'))) {
            compressingStream.addEntry(path.join(tempRepoPath, itemPath))
        }



        const queryParams = new URLSearchParams()
        queryParams.append('t', this.name)

        const target = this.target
        if (target) {
            queryParams.append('target', target)
        }

        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/build?${queryParams.toString()}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-tar'
            }
        }

        return new Promise<string>(async (resolve, reject) => {
            const req = http.request(reqOptions, async (res) => {
                let imageId: string | null = null
                res.on('data', (chunk: Buffer) => {
                    const json = JSON.parse(chunk.toString())
                    if (onMessage && json.hasOwnProperty('stream')) {
                        onMessage(json.stream)
                    }
                    else if (json.hasOwnProperty('aux')) {
                        imageId = json.aux.ID
                    }
                })
                res.on('close', async () => {
                    await deleteFolder()
                    if (imageId) {
                        resolve(imageId)
                    }
                    else {
                        reject()
                    }
                })
            })
            compressingStream.pipe(req)
        })
    }

    async remove() {
        const queryParams = new URLSearchParams()
        queryParams.append('name', this.name)
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/images?${queryParams.toString()}`,
            method: 'DELETE'
        }
        return new Promise((resolve, reject) => {
            const req = http.request(reqOptions, res => {
                if (res.statusCode !== 200) {
                    reject()
                    return
                }
                let buffData = ''
                res.on('data', chunk => buffData += chunk)
                res.on('close', () => {
                    resolve(JSON.stringify(buffData))
                })
            })
            req.end()
        })
    }

    async inspect() {
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/images/${this.name}/json`,
            method: 'GET'
        }
        return new Promise((resolve, reject) => {
            const req = http.request(reqOptions, res => {
                res.on('close', resolve)
                res.on('error', reject)
            })
            req.end()
        })
    }
}