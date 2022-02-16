import fs from "fs";
import fsp from "fs/promises";
import crypto from 'crypto'
import path from "path"

import {TEMP_STORE_PATH} from "../config/store_path";

/**
 * @param path
 */
export const createFolderIfNotExists = async (path: string) => {
    if (!fs.existsSync(path)) {
        await fsp.mkdir(path, { recursive: true })
    }
}

type TempFolderResult = {
    deleteFolder: () => Promise<void>,
    tempPath: string
}

export const createTempFolder = async (): Promise<TempFolderResult> => {
    const id = crypto.randomBytes(20).toString('hex')
    const tempPath = path.join(TEMP_STORE_PATH, id)
    await fsp.mkdir(tempPath, { recursive: true })
    const deleteFolder = async () => {
        await fsp.rm(tempPath, {
            force: true,
            recursive: true
        })
    }
    return { tempPath, deleteFolder }
}
