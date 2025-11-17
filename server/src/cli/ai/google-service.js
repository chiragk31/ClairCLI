import {google} from "@ai-sdk/google"
import { streamText } from "ai"
import {config} from "../../config/google.config.js"
import chalk from "chalk"

export class AIService{
    constructor() {
        if (!config.googleApiKey) {
            throw new Error("Google Api key is not set in env");
        }
        this.model = google(config.model, {
            apiKey:config.googleApiKey,
        })
    }

    async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
        try {
            const streamConfig = {
                model: this.model,
                messages:messages
            }
            const result = streamText(streamConfig)
            let fullResponse = ""
            for await (const chunk of result.textStream) {
                if (onChunk) {
                    onChunk(chunk)
                }
            }
            const fullResult = result;
            return {
                content: fullResponse,
                finishResponse: fullResult.finishReason,
                usage:fullResult.usage
            }
        }
        catch (error) {
            throw error
            
        }
        
    }


    async getMessage(messages, tools = undefined) {
        let fullResponse = "";
        await this.sendMessage(messages, (chunk) => {
            fullResponse += chunk;

        })
        return fullResponse
    }
}