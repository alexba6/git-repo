import fs from "fs";

export const JWT_KEY = fs.readFileSync('./keys/jwt.key')