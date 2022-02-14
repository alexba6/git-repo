import { createServer } from 'http'
import { serverApi } from './server-api'

export const server = createServer(serverApi)

server.on('listening', () => console.log('Server listening'))
