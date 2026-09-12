import * as path from 'node:path'
import { Client } from '@modelcontextprotocol/client'
import {StdioClientTransport} from "@modelcontextprotocol/client/stdio";

const repositoryPath = process.argv[2]

if (!repositoryPath) {
    console.error('Repository path is required.')
    process.exit(1)
}

const repositoryRoot = path.resolve(repositoryPath);

const client = new Client({
    name: 'repo-goblin-client',
    version: '0.1.0'
})

const transport = new StdioClientTransport({
    command: 'npx',
    args: [
        'tsx',
        'src/mcp/server.ts',
        repositoryRoot
    ]
})

try {
    await client.connect(transport)

    const { tools } = await client.listTools()

    console.log('Available tools:')

    for (const tool of tools) {
        console.log(`- ${tool.name}: ${tool.description}`)
    }

    // const result = await client.callTool({
    //     name: 'read_file',
    //     arguments: {
    //         path: 'README.md',
    //     },
    // })

    const result = await client.callTool({
        name: 'list_files',
        arguments: {
            maxResults: 30
        }
    })

    console.log('\nTool result:')

    for (const block of result.content) {
        if (block.type === 'text') {
            console.log(block.text)
        }
    }
} finally {
    await client.close()
}