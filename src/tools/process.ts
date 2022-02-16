import {spawn,  SpawnOptionsWithoutStdio} from "child_process"

/**
 * @param commands
 * @param args
 * @param options
 */
export const runProcess = (commands: string, args: string[], options?: SpawnOptionsWithoutStdio) => new Promise<string>((resolve, reject) => {
    const ps = spawn(commands, args, options)
    let out = ''
    ps.stdout.on('data', (buffer: Buffer) => {
        out = out + buffer.toString('ascii')
    })
    ps.on('close', () => resolve(out))
    ps.on('error', reject)
})