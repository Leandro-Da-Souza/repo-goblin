import { type GoblinConfig } from "../../config.js";
import { readFile } from "node:fs/promises";
import * as path from "node:path";

export async function readRepositoryFile(
    config: GoblinConfig,
    requestedFile: string
): Promise<string> {
    const resolvedPath = path.resolve(config.repositoryRoot, requestedFile)
    const relativePath = path.relative(config.repositoryRoot, resolvedPath)

    if (
        relativePath === '..' ||
        relativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativePath)
    ) {
        throw new Error('Cannot escape repository root.')
    }

    return readFile(resolvedPath, { encoding: "utf-8"})
}