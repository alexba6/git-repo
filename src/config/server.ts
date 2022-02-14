import fs from 'fs'
import { ServerOptions } from 'https'

export const serverOptions: ServerOptions = {
    cert: fs.readFileSync('./keys/server-api.crt'),
    key: fs.readFileSync('./keys/server-api.key')
}

export const SERVER_PORT = Number(process.env.SERVER_PORT)
export const SERVER_HOST = String(process.env.SERVER_HOST)
