#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";

import { Command } from "commander";
import { login, whoami ,logout} from "./commands/auth/login.js";
// import { wakeUp } from "./commands/ai/wakeUp.js";
import { start } from "./commands/ai/wakeUp.js";

dotenv.config();

async function main() {
    //Display banner
    // console.log(
        // chalk.redBright(
        //     figlet.textSync("Clair CLI", {
        //         font: "Standard",
        //         horizontalLayout:"default"
        //     })
        // )
    //     chalk.redBright("CLAIR CLI developed by")+
    // chalk.hex("#A020F0").bold("chiragk31")
    // )
    console.log(chalk.redBright("\n\n  ------ CLAIR - A cli based AI AGENT ------ \n"))

    const program = new Command("clair")
    program.version("1.1.1")
          .description(
    chalk.gray("ClairCLI developed by ") +
    chalk.hex("#A020F0").bold("chiragk31")
  )
        .addCommand(login)
        .addCommand(logout)
        .addCommand(whoami)
    // .addCommand(wakeUp)
    .addCommand(start)
    
    
    //Default action show help

    program.action(() => {
        program.help();
    })
    program.parse()
}

main().catch((err) => {
    console.log(chalk.white("Error running Clair CLI:"), err)
    process.exit(1)
})