import type { ResponseOutputItem } from "openai/resources/responses/responses";
import type { Client}  from "@modelcontextprotocol/client";

export function parseToolArguments(
    value: string
): Record<string, unknown> {
    const parsed: unknown = JSON.parse(value)

    if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
    ) {
        throw new Error(
            'Tool arguments must be a JSON object.'
        )
    }

    return parsed as Record<string, unknown>
}

export async function executeToolCalls(
    output: ResponseOutputItem[],
    availableToolNames: Set<string>,
    client: Client
) {
    const toolOutputs = []

    for (const item of output) {
        if(item.type !== "function_call") {
            continue
        }

        if(!availableToolNames.has(item.name)) {
            throw new Error(`Model requested unavailable tool: ${item.name}`)
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

    return toolOutputs
}
