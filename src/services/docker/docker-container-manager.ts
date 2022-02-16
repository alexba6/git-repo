import {Context, EnvironmentArray, Project} from "../../model/project";
import http, {RequestOptions} from "http";
import { DOCKER_SOCK } from "../../config/docker";
import {ContainerAllParams} from "./types/container";
import {ProjectError} from "../../error/error-project";
import {spawn} from "child_process";
import fs from "fs";

export enum ContainerState {
    START='start',
    STOP='stop',
    RESTART='restart'
}

export class DockerContainerManager {
    public project: Project
    public context: Context

    /**
     * @param project
     * @param context
     */
    constructor(project: Project, context: Context = Context.PRODUCTION) {
        this.project = project
        this.context = context
    }

    get name() {
        return `${this.project.id}-${this.context}`
    }

    get env(): EnvironmentArray[] {
        const options = this.project.dockerOptions
        return this.context === Context.PRODUCTION ? options.production.environment : options.test.environment
    }

    /**
     * @param imageName
     */
    create(imageName: string): Promise<void> {
        const queryParams = new URLSearchParams()
        queryParams.append('name', this.name)

        const postData = JSON.stringify({
            Env: this.env.map(([key, value]) => `${key}=${value}`),
            Image: imageName,
            HostConfig: {
                RestartPolicy: {
                    Name: 'always'
                }
            }
        })

        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: '/containers/create?' + queryParams.toString(),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }
        return new Promise<void>((resolve, reject) => {
            const req = http.request(reqOptions, res => {
                if (res.statusCode === 201) {
                    resolve()
                    return
                }
                res.on('data', d => console.log(d.toString()))
                reject()
            })
            req.write(postData)
        })
    }

    switchState(state: ContainerState) {
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/containers/${this.name}/${state}`,
            method: 'POST',
        }
        return new Promise((resolve, reject) => {
            const req = http.request(reqOptions, res => {
                if (res.statusCode === 204) {
                    resolve()
                    return
                }
                else if (res.statusCode === 304) {
                    reject(new ProjectError('ALREADY_SWITCH'))
                    return
                }
                reject()
            })
            req.end()
        })
    }

    /**
     * @param streamIn
     * @param streamOut
     */
    attach(streamIn: NodeJS.ReadableStream, streamOut: NodeJS.WritableStream) {
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/containers/${this.name}/attach?stream=1`,
            method: 'POST',
        }

        const req = http.request(reqOptions, res => {
            if (res.statusCode === 200) {
                res.pipe(streamOut)
            }
        })
        req.write('')
    }

    inspect(): Promise<ContainerAllParams> {
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/containers/${this.name}/json`,
            method: 'GET',
        }

        return new Promise<ContainerAllParams>((resolve, reject) => {
            const req = http.request(reqOptions, res => {
                if (res.statusCode === 200) {
                    let bufferData = ''
                    res.on('data', chunk => bufferData += chunk.toString())
                    res.on('close', () => {
                        resolve(JSON.parse(bufferData))
                    })
                    return
                }
                reject(new ProjectError('CONTAINER_NOT_FOUND'))
            })
            req.write('')
        })
    }

    /**
     * @param onLog
     */
    log(onLog: (log: string) => void) {
        const query = new URLSearchParams()
        query.append('follow', '1')
        query.append('tail', '150')
        query.append('stdout', '1')
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/containers/${this.name}/logs?${query.toString()}`,
            method: 'GET',
        }
        const req = http.request(reqOptions, res => {
            if (res.statusCode === 200) {
                res.on('data', (chunk: Buffer) => {
                    onLog(chunk.toString())
                })
            }
        })
        req.write('')
    }

    /**
     * @param follow
     * @param onLog
     */
    getLog(follow: boolean, onLog: (log: string) => void) {
        const query = new URLSearchParams()
        query.append('stdout', '1')
        if (follow) {
            query.append('follow', '1')
        }
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/containers/test/logs?${query.toString()}`,
            method: 'get',
        }
        return new Promise((resolve, reject) => {
            const req = http.request(reqOptions, res => {
                if (res.statusCode === 200) {
                    res.on('data', (chunk) => {
                        onLog(chunk.toString())
                    })
                    req.on('close', resolve)
                    return
                }
                reject()
            })
            req.write('')
        })
    }

    remove() {
        const query = new URLSearchParams()
        query.append('force', '1')
        const reqOptions: RequestOptions = {
            socketPath: DOCKER_SOCK,
            path: `/containers/${this.name}?${query.toString()}`,
            method: 'DELETE',
        }
        return new Promise((resolve, reject) => {
            const req = http.request(reqOptions, res => {
                if (res.statusCode === 204) {
                    resolve()
                    return
                }
                reject()
            })
            req.write('')
        })
    }
}