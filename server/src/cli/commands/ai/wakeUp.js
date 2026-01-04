import chalk from "chalk";
import { Command } from "commander";
import yoctoSpinner from "yocto-spinner";
import { getStoredToken } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";
import { select } from "@clack/prompts";
import { startChat } from "../../chat/chat-with-clair.js";
import {startToolChat} from "../../chat/chat-with-ai.js"
import { startAgentChat } from "../../chat/chat-with-ai-agent.js";

const wakeUpAction = async () => {
    const token = await getStoredToken();
    if (!token?.access_token) {
        console.log(chalk.red("Not authenticated. please login"))
        return;
        
    }

    const spinner=yoctoSpinner({text:"Fetching user information:"})
    spinner.start();
    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    token:token.access_token
                }
            }
        }, select: {
            id: true,
            name: true,
            email: true,
            image:true
        }
    })

    spinner.stop();

    if (!user) {
        console.log(chalk.red("User not found."));
        return;
    }
    console.log(chalk.green(`Welcome back,${user.name}!\n`))
    
    const choice = await select({
        message: "Select an Option:",
        options: [{
            value: "chat",
            label: "chat",
            hint: "Simple chat with Clair",
        },
        {
            value: "tool",
            label: "Tool calling",
            hint: "Chat with tools(Google Search, Code Execution)",
        },
        {
            value: "agent",
            label: "Agentic Mode",
            hint: "Advanced AI agent(Coming soon)",
        }
        ]
    });
    switch (choice) {
        case "chat":
            startChat()
            break;
        case "tool":
            await startToolChat()
            break;
        case "agent":
            await startAgentChat()
            break;
    }
}

// export const wakeUp = new Command("wakeup")
// .description("Wakeup the clair")
// .action(wakeUpAction)



export const start = new Command("start")
.description("Start the Clair AI")
.action(wakeUpAction)