export function createRunMetrics() {
    const startedAt = performance.now()

    let modelRequests = 0
    let toolCalls = 0
    const toolsUsed = new Map<string, number>()

    return {
        recordModelRequest() {
            modelRequests++
        },

        recordToolCall(toolName: string) {
            toolCalls++

            const currentCount = toolsUsed.get(toolName) ?? 0
            toolsUsed.set(toolName, currentCount + 1)
        },

        getSnapshot() {
            return {
                modelRequests,
                toolCalls,
                toolsUsed: Object.fromEntries(toolsUsed),
                elapsedMs: performance.now() - startedAt
            }
        }
    }
}
