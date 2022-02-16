import './config/env'
import {createConnection} from 'typeorm'
import { server } from './server'
import { SERVER_HOST, SERVER_PORT } from './config/server'
import { databaseConfiguration } from './config/database'
import crypto, {BinaryLike} from "crypto";
import {Buffer} from "buffer";
import {promisify} from "util";

const scrypt: (password: BinaryLike, salt: BinaryLike, keyLen: number) => Promise<Buffer> = promisify<BinaryLike, BinaryLike, number, Buffer>(crypto.scrypt)

server.listen(SERVER_PORT, SERVER_HOST)

createConnection(databaseConfiguration).then(async () => {
    console.log('Database connected established')
})


