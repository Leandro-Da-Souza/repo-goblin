import { execFile } from "node:child_process";
import { realpath } from "node:fs/promises";
import { GoblinConfig } from "../../config.js";
import {promisify} from "node:util";

const execFileAsync = promisify(execFile)

export async function searchRepositoryCode(
    config: GoblinConfig,
    query: string,
    maxResults = 50
): Promise<string[]> {
    const args = [
        '--line-number',
        '--column',
        '--no-heading',
        '--color',
        'never',
        '--max-filesize',
        '1M',
        '-e',
        query,
        '.'
    ]

    const repositoryRoot = await realpath(config.repositoryRoot)

    try {
        const { stdout } = await execFileAsync('rg', args, {
            cwd: repositoryRoot,
            encoding: 'utf-8',
            maxBuffer: 1024 * 1024
        })

        return stdout.split('\n').filter(Boolean).slice(0, maxResults)

    } catch (error) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 1
        ) {
            return []
        }
        throw error
    }
}