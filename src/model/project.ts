import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import crypto from "crypto"
import path from "path"
import { runProcess } from "../tools/process";

import { User } from "./user"
import { REPO_STORE_PATH } from "../config/repo";
import { createFolderIfNotExists } from "../tools/file";
import { DockerActionParams } from "../actions/docker";


export type ProjectSettings = {
    actions: {
        docker?: DockerActionParams
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
        type: 'json',
        nullable: false
    })
    settings: ProjectSettings

    constructor() {
        this.id = crypto.randomUUID()
        this.createdAt = new Date()
        this.owner = null
        this.settings = {
            actions: {
                docker: undefined
            }
        }
    }

    get projectPath() {
        const mainPath = path.join(REPO_STORE_PATH, this.id)
        return {
            project: mainPath,
            repository: path.join(mainPath, 'repo.git'),
            docker: path.join(mainPath, 'docker')
        }
    }


    public async initFolder() {
        const { project, repository, docker } = this.projectPath
        await createFolderIfNotExists(project)
        await createFolderIfNotExists(repository)
        await createFolderIfNotExists(docker)

        await runProcess('git', ['init', '--bare', repository])
        await runProcess('git', ['init', docker])
        await runProcess('git', ['remote', 'add', 'origin', repository], { cwd: docker })
    }

    get info() {
        return {
            id: this.id,
            name: this.name,
            tags: this.tags,
            createdAt: this.createdAt
        }
    }
}