import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import crypto from "crypto"
import path from "path"
import { runProcess } from "../tools/process";

import { User } from "./user"
import {REPO_STORE_PATH, REPOSITORY_NAME} from "../config/store_path";
import { createFolderIfNotExists } from "../tools/file";


export enum Context {
    PRODUCTION='production',
    TEST='test'
}

export type EnvironmentArray = [string, string | number | boolean | null]

export type ProjectDockerOptions = {
    git: {
        branchTrack: string,
        autoBuild: boolean
    },
    test: {
        enable: boolean,
        target: string | null,
        environment: EnvironmentArray[]
    },
    production: {
        target: string | null,
        environment: EnvironmentArray[]
    }
}

@Entity({
    name: 'projects'
})
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        nullable: false,
        unique: true
    })
    name!: string

    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags!: string[]

    @ManyToOne(() => User, user => user.projects)
    owner: User | null

    @Column({ nullable: false })
    createdAt: Date

    @Column({
        type: 'json'
    })
    dockerOptions: ProjectDockerOptions

    constructor() {
        this.id = crypto.randomUUID()
        this.createdAt = new Date()
        this.owner = null
        this.dockerOptions = {
            git: {
                branchTrack: 'master',
                autoBuild: true
            },
            test: {
                enable: false,
                target: null,
                environment: []
            },
            production: {
                target: null,
                environment: []
            }
        }
    }

    get projectPath() {
        const mainPath = path.join(REPO_STORE_PATH, this.id)
        return {
            project: mainPath,
            repository: path.join(mainPath, REPOSITORY_NAME)
        }
    }
    public async initFolder() {
        const { project, repository } = this.projectPath
        await createFolderIfNotExists(project)
        await createFolderIfNotExists(repository)

        await runProcess('git', ['init', '--bare', repository])
    }

    /**
     * @param context
     */
    getEnvironment(context: Context) {
        return context === Context.PRODUCTION ?
            this.dockerOptions.production.environment
            : this.dockerOptions.test.environment
    }

    /**
     * @param context
     * @param environment
     */
    setEnvironment(context: Context, environment: EnvironmentArray[]) {
        if (context === Context.PRODUCTION) {
            this.dockerOptions.production.environment = environment
        }
        else if (context === Context.TEST){
            this.dockerOptions.test.environment = environment
        }
    }

    get info() {
        return {
            id: this.id,
            name: this.name,
            tags: this.tags,
            createdAt: this.createdAt
        }
    }

    get allInfo() {
        return {
            id: this.id,
            name: this.name,
            tags: this.tags,
            createdAt: this.createdAt,
            options: this.dockerOptions
        }
    }
}