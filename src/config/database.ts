import { ConnectionOptions } from 'typeorm'
import {User} from "../model/user";
import {Project} from "../model/project";


export const databaseConfiguration: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port:  Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    synchronize: true,
    logging: false,
    database: process.env.DATABASE_NAME,
    entities: [
        User,
        Project
    ]
}