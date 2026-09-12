import 'dotenv/config'
import {OpenAI} from "openai";

export function createOpenAIClient(): OpenAI {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPEN_API_KEY is required. Add it to your .env file.')
    }

    return new OpenAI({
        apiKey: process.env.OPEN_API_KEY
    })
}
