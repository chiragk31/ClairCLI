import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts"
import { logger } from "better-auth"
import { createAuthClient } from "better-auth/client"
import { deviceAuthorizationClient } from "better-auth/client/plugins"
import chalk from "chalk";
import { Command } from "commander";
import fs from "node:fs/promises"
import open from "open"
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";
import * as z from "zod/v4";
import dotenv from "dotenv";
import prisma from "../../../lib/db.js";



dotenv.config();

const URL = "http://localhost:3005";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");
export async function loginAction(opts) {
    const options = z.object({
        serverUrl: z.string().optional(),
        clientId: z.string().optional(),


    })
    const serverUrl = options.serverUrl || URL;
    const clientId = options.clientId || CLIENT_ID;
    
    intro(chalk.bold("🔒-Clair Auth Cli Login"))

    //Change it with token management utils
    const existingToken = false;
    const expired = false;

    if (existingToken && !expired) {
        const shouldReAuth = await confirm({
            message: "You are already login.. Do you want to Login again?",
            initialValue:false,
            
        })
        if (isCancel(shouldReAuth) || !shouldReAuth) {
            cancel("Login Cancelled")
            process.exit(0)

        }
    }

    const authClient = createAuthClient({
        baseURL: serverUrl,
        plugins:[deviceAuthorizationClient()],
    })

    const spinner = yoctoSpinner({ text: "Requesting device authorization..." });
    spinner.start();
    try {
        const { data ,err} = await authClient.device.code({
  client_id: "your-client-id",
  scope: "openid profile email",
        });
        spinner.stop();

        if (err || !data) {
            logger.error(
                `Failed to request device authorization:${err.error_description}`
            )
            process.exit(1)
            
        }

        const {
            device_code,
            user_code,
            verification_uri,
            verification_uri_complete,
            interval = 5,
            expires_in,
        } = data;

        console.log(chalk.cyan("Device Authorization require"))
        console.log(`Please Visit ${chalk.underline.blue(verification_uri || verification_uri_complete)}`)
        console.log(`Enter Code ${chalk.bold.green(user_code)}`);
        const shouldOpen = await confirm({
            message: "Open browser automatically",
            initialValue:true
        })

        if (!isCancel(shouldOpen) && shouldOpen) {
            const urlToOpen = verification_uri || verification_uri_complete
            await open(urlToOpen)
        }


        console.log(chalk.grey(
            `Waiting for authorization (expires in ${Math.floor(

                expires_in/60
            )}minutes)......`
        ))


    } catch (error) {


        
    }
    
}




//Command Setup----------->


export const login = new Command("login")
    .description("Login to Better Auth")
    .option("--Server url <url>", "The better auth server url", URL)
    .option("--Client-id <id>", "The oAuth client ID", CLIENT_ID)
    .action(loginAction)
