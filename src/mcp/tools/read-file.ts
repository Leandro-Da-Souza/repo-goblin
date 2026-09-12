import type { GoblinConfig } from "../../config.js";
import { readFile, realpath } from "node:fs/promises";
import * as path from "node:path";

function escapeRoot(
    repositoryRoot: string,
    requestedPath: string
): boolean {
    const relativePath = path.relative(repositoryRoot, requestedPath)

    return (
        relativePath === '..' ||
        relativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativePath)
    )
}

export async function readRepositoryFile(
    config: GoblinConfig,
    requestedFile: string
): Promise<string> {
    const realRepositoryRoot = await realpath(config.repositoryRoot)

    const resolvedPath = path.resolve(realRepositoryRoot, requestedFile)

    // Stop direct traversal outside root
    if (escapeRoot(realRepositoryRoot, resolvedPath)) {
        throw new Error('Cannot escape repository root.')
    }

    const realRequestedPath = await realpath(resolvedPath);

    // Stop indirect traversal through a symlink
    if (escapeRoot(realRepositoryRoot, realRequestedPath)) {
        throw new Error('Cannot escape repository root.')
    }

    return readFile(realRequestedPath, { encoding: "utf-8" })
}