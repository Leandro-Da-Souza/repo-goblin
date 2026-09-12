import { readdir, realpath } from "node:fs/promises";
import * as path from 'node:path';

import type { GoblinConfig } from "../../config.js";

const IGNORED_DIRECTORIES = new Set([
    '.git',
    'node_modules',
    'dist',
    'coverage',
    '.idea',
])

async function walk(
    currentDirectory: string,
    repositoryRoot: string,
    results: string[],
    maxResults: number
): Promise<void> {
    if (results.length >= maxResults) {
        return;
    }

    const entries = await readdir(currentDirectory, {
        withFileTypes: true
    })

    entries.sort((a, b) => a.name.localeCompare(b.name))

    for (const entry of entries) {
        if (results.length >= maxResults) {
            return;
        }

        if (entry.isSymbolicLink()) {
            continue;
        }

        if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
            continue;
        }

        const absolutePath = path.join(currentDirectory, entry.name)

        if (entry.isDirectory()) {
            await walk(absolutePath, repositoryRoot, results, maxResults)
        } else if (entry.isFile()) {
            const relativePath = path.relative(
                repositoryRoot,
                absolutePath,
            )

            results.push(relativePath.split(path.sep).join('/'))
        }
    }
}

export async function listRepositoryFiles(
    config: GoblinConfig,
    maxResults = 200,
): Promise<string[]> {
    const repositoryRoot = await realpath(config.repositoryRoot)
    const results: string[] = []

    await walk(
        repositoryRoot,
        repositoryRoot,
        results,
        maxResults
    )

    return results
}