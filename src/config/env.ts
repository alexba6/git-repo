import path from 'path'
import fs from 'fs'
import { config } from 'dotenv'

export const NODE_ENV: 'production' | 'development' | 'test' = String(process.env.NODE_ENV) as any || 'production'

const envPath = path.join(__dirname, '../../', NODE_ENV.toLocaleLowerCase() + '.env')

if (fs.existsSync(envPath)) {
    config({
        path: envPath
    })
} else {
    config()
}
export const DEBUG = !!process.env.DEBUG
