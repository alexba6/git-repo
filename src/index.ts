import './config/env'
import {createConnection} from 'typeorm'
import { server } from './server'
import { SERVER_HOST, SERVER_PORT } from './config/server'
import { databaseConfiguration } from './config/database'

server.listen(SERVER_PORT, SERVER_HOST)

createConnection(databaseConfiguration).then(() => console.log('Database connected established'))
