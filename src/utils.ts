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
