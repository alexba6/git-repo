import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import crypto, {BinaryLike} from 'crypto'
import { promisify } from 'util'
import { Buffer } from 'buffer'

import {UserError} from '../error/user'
import {Project} from "./project";

const scrypt: (password: BinaryLike, salt: BinaryLike, keyLen: number) => Promise<Buffer> = promisify<BinaryLike, BinaryLike, number, Buffer>(crypto.scrypt)

type Password = {
    salt: string,
    hash: string
}

@Entity({
    name: 'users'
})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    email!: string

    @Column({ nullable: false })
    username!: string

    @Column({
        nullable: false,
        type: 'json'
    })
    password: Password | undefined

    @Column({ nullable: false })
    createdAt: Date

    @OneToMany(() => Project, project => project.owner)
    projects: Project[] | null

    @Column()
    maxProject: number

    constructor() {
        this.id = crypto.randomUUID()
        this.createdAt = new Date()
        this.projects = null
        this.maxProject = 2
    }

    /**
     * Hash the user password
     * @param password
     */
    async hashPassword(password: string) {
        const saltBuffer = crypto.randomBytes(12)
        const hashBuffer = await scrypt(password, saltBuffer.toString('hex'), 64)
        this.password = {
            salt: saltBuffer.toString('hex'),
            hash: hashBuffer.toString('hex')
        }
    }

    async isValidPassword(password: string) {
        if (!this.password) {
            throw new Error('Password not set !')
        }
        const { salt, hash } = this.password
        const hashBuffer = Buffer.from(hash, 'hex')
        const derivedHash = await scrypt(password, salt, 64)
        return crypto.timingSafeEqual(hashBuffer, derivedHash)
    }

    /**
     * Check the user password
     * @param password
     */
    async verifyPassword(password: string) {
        if (!await this.isValidPassword(password)) {
            throw new UserError('INVALID_PASSWORD')
        }
    }

    get info() {
        return {
            id: this.id,
            email: this.email,
            username: this.username,
            maxProject: this.maxProject,
            createdAt: this.createdAt
        }
    }
}