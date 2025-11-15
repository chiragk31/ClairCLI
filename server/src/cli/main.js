#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";

import { Command } from "commander";
import { login } from "./commands/auth/login.js";

dotenv.config();

async function main() {
    //Display banner
    console.log(
        chalk.red(
            figlet.textSync("Clair CLI", {
                font: "Standard",
                horizontalLayout:"default"
            })
        )
    )
    console.log(chalk.cyanBright("  ------A cli based AI tool------ \n"))

    const program = new Command("clair")
    program.version("1.1.1")
        .description("Clair a cli based AI tool developed by chiragk31")
        .addCommand(login)
    
    
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