import fs from "fs";
import fsp from "fs/promises";

/**
 * @param path
 */
export const createFolderIfNotExists = async (path: string) => {
    if (!fs.existsSync(path)) {
        await fsp.mkdir(path, { recursive: true })
    }
}