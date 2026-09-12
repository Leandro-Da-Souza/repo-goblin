import * as path from 'node:path'
import 'dotenv/config'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { createOpenAIClient } from "../model/openai-client.js";
import {parseToolArguments} from "../utils.js";

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

const openai = createOpenAIClient();
const model = process.env.OPENAI_API_MODEL

if (!model) {
    console.error(
        'OPENAI_API_MODEL is required. Add it to your .env.'
    )
    process.exit(1)
}

try {
    await client.connect(transport)

    const { tools } = await client.listTools()

    const availableToolNames = new Set(
        tools.map((tool) => tool.name)
    )

    const modelTools = tools.map((tool) => ({
        type: 'function' as const,
        name: tool.name,
        description: tool.description ?? '',
        parameters: tool.inputSchema,
        strict: false
    }))

    const response = await openai.responses.create({
        model,
        instructions: [
            'You are a read-only repository investigator.',
            'Use the provided tools to inspect the repository.',
            'Do not claim to have read files unless a tool returned their contents.',
            'Begin by discovering the repository structure.'
        ].join(' '),
        input:
            'Inspect this repository and determine what the project does. Do not propose code' +
            ' changes yet.',
        tools: modelTools,
        tool_choice: 'required'
    })

    const toolOutputs = []

    for (const item of response.output) {
        if (item.type !== 'function_call') {
            continue
        }

        if (!availableToolNames.has(item.name)) {
            throw new Error(
                `Model requested unavailable tool: ${item.name}`
            )
        }

        const args = parseToolArguments(item.arguments)

        console.log(`Goblin calls: ${item.name}`)
        console.log(`Arguments: ${JSON.stringify(args)}`)

        const toolResult = await client.callTool({
            name: item.name,
            arguments: args
        })

        toolOutputs.push({
            type: 'function_call_output' as const,
            call_id: item.call_id,
            output: JSON.stringify(toolResult)
        })
    }

    if (toolOutputs.length === 0) {
        console.log(response.output_text)
    } else {
        const nextResponse = await openai.responses.create({
            model,
            previous_response_id: response.id,
            input: toolOutputs,
            tools: modelTools,
            tool_choice: 'auto'
        })

        console.dir(nextResponse.output, {
            depth: null
        })
    }

} finally {
    await client.close()
}
