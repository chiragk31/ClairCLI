import {google} from "@ai-sdk/google"
import { convertToModelMessages, generateObject, streamText, tool } from "ai"
import {config} from "../../config/google.config.js"
import chalk from "chalk"
import { startsWith } from "zod";

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
                 messages: messages,
            }

            if (tools && Object.keys(tools).length > 0) {
                streamConfig.tools = tools;
                streamConfig.maxSteps = 5;//allow upto 5 tool call steps
                console.log(chalk.grey(`[DEBUG] Tools enabled: ${Object.keys(tools).join(", ")}`))

            }

            // convertToModelMessages(messages)
            const result = streamText(streamConfig)
            let fullResponse = ""
            for await (const chunk of result.textStream) {
                if (onChunk) {
                    onChunk(chunk)
                }
            }
            const fullResult = result;

            const toolCalls = [];
            const toolResults = [];

            if (fullResult.steps && Array.isArray(fullResult.steps)) {
                
                for (const step of fullResult.steps) {
                    if (step.toolCalls && step.toolCalls.length > 0) {
                        for (const toolCall of step.toolCalls) {
                            toolCalls.push(toolCall);

                            if (onToolCall) {
                                onToolCall(toolCall);
                            }
                        }
                    }

                    if (step.toolResults && step.toolResults.length > 0) {
                        toolResults.push(...step.toolResults)
                    }
                }
            }
            return {
                content: fullResponse,
                finishResponse: fullResult.finishReason,
                usage: fullResult.usage,
                toolCalls,
                toolResults,
                steps:fullResult.steps,
            }
        }
        catch (error) {
            throw error
            
        }
        
    }


    async getMessage(messages, tools = undefined) {
        let fullResponse = "";
        const result=await this.sendMessage(messages, (chunk) => {
            fullResponse += chunk;

        },tools)
       return result.content;
    }
    
    /**
     * Generate structured output using a zod schema
     * @param {Object} schema -zod schema
     * @param {string} prompt -prompt for generation
     * @returns {Promise<Object>} -parsed object matching the schema
    */

    async generateStructured(schema, prompt) {
        try {
            const result = await generateObject({
                model: this.model,
                schema: schema,
                prompt:prompt
            })

            return result.object
        } catch (error) {
            console.error(chalk.red("AI structured generation error:"), error.message);
            throw error;
            
        }
    }
}