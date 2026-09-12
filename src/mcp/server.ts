import * as path from 'node:path'
import {McpServer} from "@modelcontextprotocol/server";
import {StdioServerTransport} from "@modelcontextprotocol/server/stdio";
import * as z from 'zod/v4'

import type { GoblinConfig} from "../config.js";
import { readRepositoryFile } from "./tools/read-file.js";
import { listRepositoryFiles } from "./tools/list-files.js";

const targetPath = process.argv[2]

if(!targetPath) {
    console.error("Usage: npm run dev -- <repository-path>")
    process.exit(1)
}

const config: GoblinConfig = {
    repositoryRoot: path.resolve(targetPath)
}

const server = new McpServer({
    name: 'repo-goblin-server',
    version: '0.1.0'
})

server.registerTool(
    'read_file',
    {
        description: 'Read a UTF-8 text file inside the target repository.',
        inputSchema: z.object({
            path: z
                .string()
                .min(1)
                .describe('Path relative to the repository root')
        })
    },
    async ({ path }) => {
        const contents = await readRepositoryFile(config, path)

        return {
            content: [
                {
                    type: 'text',
                    text: contents
                }
            ]
        }
    }
)

server.registerTool(
    'list_files',
    {
        description:
            'List source and project files inside the target repository.',
        inputSchema: z.object({
            maxResults: z
                .number()
                .int()
                .min(1)
                .max(500)
                .default(200),
        }),
    },
    async ({ maxResults }) => {
        const files = await listRepositoryFiles(
            config,
            maxResults
        )

        return {
            content: [
                {
                    type: 'text',
                    text: files.join('\n')
                }
            ]
        }
    }
)

const transport = new StdioServerTransport()

await server.connect(transport)