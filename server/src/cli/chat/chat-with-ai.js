import chalk from "chalk";
import boxen from "boxen";
import {text, isCancel, cancel, intro, outro, multiselect} from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import {marked} from "marked"
import { markedTerminal } from "marked-terminal";
import {AIService} from "../ai/google-service.js"
import { ChatService } from "../../service/chat.service.js";
import { getStoredToken } from "../../lib/token.js";
import prisma from "../../lib/db.js";
import { availableTools, getEnabledTools, enableTools,  resetTools, getEnabledToolNames } from "../../config/tool.config.js";
import { tool } from "ai";

marked.use(

    markedTerminal({
        code: chalk.cyan,
        blockquote: chalk.grey.italic,
        heading: chalk.green.bold,
        firstHeading: chalk.magenta.underline.bold,
        hr: chalk.reset,
        listitem: chalk.reset,
        list: chalk.reset,
        paragraph: chalk.reset,
        strong: chalk.bold,
        em: chalk.italic,
        codespan: chalk.yellow.bgBlack,
        del: chalk.dim.gray.strikethrough,
        link: chalk.blue.underline,
        href: chalk.blue.underline,
    })

);

const aiService = new AIService();
const chatService = new ChatService();

async function getUserFromToken(){
    const token = await getStoredToken();
    if (!token?.access_token) {
        throw new Error("not authenticated. Please run 'clair login' first.")
    }
    const spinner = yoctoSpinner({ text: "Authenticating..." })
    spinner.start();
    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    token:token.access_token
                }
            }
        }
    })

    if (!user) {
        spinner.error("User not found");
        throw new error("User not found. Please login again.")

    }
    spinner.success(`Welcome back,${user.name}`)
    return user;
}


async function initConversation(userId, conversationId = null, mode = "tool") {
    const spinner = yoctoSpinner({ text: "Loading Conversation..." })
    spinner.start();
    const conversation = await chatService.getOrCreateConversation(
        userId,
        conversationId,
        mode
    )
    spinner.success("Conversation loaded..")

    //Display Conversation info in box
    const enabledToolNames = getEnabledToolNames();
    const toolsDisplay= boxen(
        `${chalk.bold("Active Tools")} : ${enabledToolNames.join(", ")}\n: ${chalk.grey("No tools Enabled")}`
    );
    const conversationInfo = boxen(
        `${chalk.bold("Conversation")} : ${conversation.title}\n ${chalk.grey("ID:" + conversation.id)}\n ${chalk.gray("Mode:" + conversation.mode)} ${toolsDisplay}`,
        {
            padding: 1,
            margin: { top: 1, bottom: 1 },
            borderStyle: "round",
            borderColor: "cyan",
            title: "Chat Session",
            titleAlignment: "center"
        }
    );
    console.log(conversationInfo);
    //Display if we have any exisiting messages

    if (conversation.messages?.length > 0) {
        console.log(chalk.yellow("Previous Messages:\n"))
        displayMessages(conversation.messages);

    }
    
    return conversation;
}

function displayMessages(messages) {
    messages.forEach(msg => {
        if (msg.role === "user") {
            const userBox = boxen(chalk.white(msg.content), {
                padding: 1,
                margin: { left: 2, bottom: 1 },
                borderStyle: "round",
                borderColor: "blue",
                title: "You",
                titleAlignment: "left",
            });
            console.log(userBox)
        }
        else {
            const renderedContent = marked.parse(msg.content);
            const assistantBox = boxen(renderedContent.trim(), {
                padding: 1,
                margin: { left: 2, bottom: 1 },
                borderStyle: "round",
                borderColor: "green",
                title: "Assistant",
                titleAlignment: "left",
            });
            console.log(assistantBox)
        }
    })
}


async function saveMessage(conversationId,role,content) {
    return await chatService.addMessage(conversationId,role,content)
}


async function getAIResponse(conversationId) {
    const spinner = yoctoSpinner({
        text: "Clair is Thinking...",
        color: "cyan"
    }).start();

    const dbMessages = await chatService.getMessages(conversationId)
    const aiMessages = chatService.formatMessagesForAI(dbMessages)

    const tools = getEnabledTools();

    let fullResponse = "";
    let isFirstChunk = true;
    const toolCallsDetected = [];
    try {
        const result = await aiService.sendMessage(aiMessages, (chunk) => {
            if (isFirstChunk) {
                spinner.stop();
                console.log("\n");
                const header = chalk.green.bold("Clair Assistant:");
                console.log(header);
                console.log(chalk.gray("-".repeat(60)));
                isFirstChunk = false;
            }
            fullResponse += chunk;

        },
            tools, (toolCall) => {
            toolCallsDetected.push(toolCall)
        }
            
        )
        if (toolCallsDetected.length > 0) {
            console.log("\n");
            const toolCallBox = boxen(
                toolCallsDetected.map(tc => `
                    ${chalk.cyan("Tool:")} ${tc.toolName}\n${chalk.gray("Args:")
                    } ${JSON.stringify(tc.args, null, 2)}
                    `).join("\n\n"), {
                padding: 1,
                margin: 1,
                borderStyle: "round",
                borderColor: "cyan",
                title: "Clair tool calls"
            }
            );
            console.log(toolCallBox);
        }
        //display tool result
        if (result.toolResults && result.toolResults.length > 0) {
            const toolResultBox = boxen(
                result.toolResults.map(tr => `
                    ${chalk.green("Tool:")} ${tr.toolName} \n${
                    chalk.gray("Result:")
                    } ${JSON.stringify(tr.result,null,2).slice(0,200)}...
                    `).join("\n\n"),{
                              padding: 1,
                margin: 1,
                borderStyle: "round",
                borderColor: "green",
                title: "Clair tool result"

                    }
            )
            console.log(toolResultBox);
            
        }


        //get the  ai respose in the proper format
        console.log("\n");
        const renderedMarkdown = marked.parse(fullResponse);
        console.log(renderedMarkdown);
        console.log(chalk.gray("-".repeat(60)))
        console.log("\n");
        return result.content;
    }
    catch (error) {
        spinner.error("Failed to get AI tool response");
        throw error;
        
    }
}

async function updateConversationTitle(conversationId, userInput, messageCount) {
    if (messageCount === 1) {
        const title = userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");
        await chatService.updateTitle(conversationId, title);
    }
    
}



async function selectTools() {
    const toolOptions = availableTools.map(tool => ({
        value: tool.id,
        label: tool.name,
        hint:tool.description
    }))

    const selectedTools = await multiselect({
        message: chalk.cyan("Select tools to enable (Space to select, Enter to confirm):")
        ,
        options:toolOptions,
        required:false,
    })
    if (isCancel(selectedTools)) {
        cancel(chalk.yellow("Tool selection cancelled"))
        process.exit(0);
    }
    enableTools(selectedTools)
    if (selectedTools.length == 0) {
        console.log(chalk.yellow("\n No tools selected. CLAIR will work without tools. \n")

        )
    }
    else {
        const toolsBox = boxen(
            chalk.green(`
                Enabled tools:\n${selectedTools.map(id => {
                    const tool = availableTools.find(t => t.id === id);
                    return `${tool.name}`;
                }).join('\n')}
                `), {
                padding: 1,
                margin: { top: 1, bottom: 1 },
                borderStyle: "round",
                borderColor: "green",
                title: "Active Tools",
                    titleAlignment:"Center"
                }
        )
        console.log(toolsBox);
    } return selectedTools.length > 0;
}


async function chatLoop(conversation) {

    const enabledToolNames = getEnabledToolNames();
    const helpBox = boxen(
        `${chalk.gray('Type your message and press enter')} \n${chalk.gray('Clair has acess to:')} ${enabledToolNames.length>0 ? enabledToolNames.join(", "):"No tools"} \n${chalk.gray('Type "exit to end conversation')} \n${chalk.gray("Press ctrl+c to quit")}`, {
        padding: 1,
        margin: { bottom: 1 },
        borderStyle: "round",
        borderColor: "gray",
        dimBorder: true,
            
            
    }
    );
    console.log(helpBox);


    while (true) {
        const userInput = await text({
            message: chalk.blue("your message"),
            placeholder: "Type your message....",
            validate(value) {
                if (!value || value.trim().length === 0) {
                    return "Message cannot be empty";
                } 
            }
            
        })
        if (isCancel(userInput)) {
            const exitBox = boxen(chalk.yellow("Chat session ended. GoodBye!!"), {
                padding: 1,
                margin: 1,
                boarderStyle: "round",
                borderColor:"yellow"
            })
            console.log(exitBox);
            process.exit(0);
        }
        if (userInput.toLowerCase() === "exit") {
            const exitBox = boxen(chalk.yellow("Chat session ended, Goodbye!"), {
                padding: 1,
                margin: 1,
                borderStyle: "round",
                borderColor: "yellow"
            });
            console.log(exitBox);
            break;

        }

        const userBox = boxen(chalk.white(userInput), {
            padding: 1,
            margin: { left: 2, top: 1, bottom: 1 },
            borderStyle: "round",
            borderColor: "blue",
            title: "you",
            titleAlignment:"left"
            
        })

        console.log(userBox);


        await saveMessage(conversation.id, "user", userInput);
        const message = await chatService.getMessages(conversation.id)
        const aiResponse = await getAIResponse(conversation.id)
        await saveMessage(conversation.id, "assistant", aiResponse)
        await updateConversationTitle(conversation.id,userInput,message.length)
    }
    
    
}



export async function startToolChat(conversationId = null) {
    try {
        intro(boxen(
            chalk.bold.cyan("CLAIRCLI - Clair tool Calling Mode"), {
                padding: 1,
                borderColor: "cyan",
                borderStyle:"double"
            }
        ))

        const user = await getUserFromToken();
        await selectTools();
        const conversation = await initConversation(user.id, conversationId, "tool")
        await chatLoop(conversation);
        resetTools();

        outro(chalk.green("Thanks for using clair tools"))
        
    } catch (error) {
        const errorBox = boxen(chalk.red(`Error: ${error.message}`), {
            padding: 1,
            margin: 1,
            borderColor: "red",
            borderStyle:"round"
    })
        console.log(errorBox);
        resetTools();
        process.exit(1);
    }
}