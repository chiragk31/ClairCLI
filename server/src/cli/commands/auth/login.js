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
import * as z from "zod";
import dotenv from "dotenv";
import prisma from "../../../lib/db.js";
import { clearStoredToken, getStoredToken, isTokenExpired, storeToken,requireAuth } from "../../../lib/token.js";



dotenv.config();

const URL = "http://localhost:3005";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

//Token Management


export async function loginAction(opts) {
    const options = z.object({
        serverUrl: z.string().optional(),
        clientId: z.string().optional(),


    })
    const serverUrl = options.serverUrl || URL;
    const clientId = options.clientId || CLIENT_ID;
    
    intro(chalk.bold("🔒-Clair Auth Cli Login"))

    //Change it with token management utils
    const existingToken = await getStoredToken();
    const expired = isTokenExpired(existingToken);

    if (existingToken && !expired) {
        const shouldReAuth = await confirm({
            message: "You are already login.. Do you want to Login again?",
            initialValue: false,
            
        })
        if (isCancel(shouldReAuth) || !shouldReAuth) {
            cancel("Login Cancelled")
            process.exit(0)

        }
    }

    const authClient = createAuthClient({
        baseURL: serverUrl,
        plugins: [deviceAuthorizationClient()],
    })

    const spinner = yoctoSpinner({ text: "Requesting device authorization..." });
    spinner.start();
    try {
        const { data, err } = await authClient.device.code({
            client_id: clientId,
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
        console.log(`Please Visit ${chalk.underline.blue( verification_uri || verification_uri_complete )}`)
        console.log(`Enter Code ${chalk.bold.green(user_code)}`);
        const shouldOpen = await confirm({
            message: "Open browser automatically",
            initialValue: true
        })

        if (!isCancel(shouldOpen) && shouldOpen) {
            const urlToOpen = verification_uri_complete || verification_uri  
            await open(urlToOpen)
        }


        console.log(chalk.grey(
            `Waiting for authorization (expires in ${Math.floor(

                expires_in / 60
            )}minutes)......`
        ))

        const token = await pollForToken(
            authClient,
            device_code,
            clientId,
            interval
        );
        if (token) {
            //added token in store token as parameter
            const saved = await storeToken(token)
            if (!saved) {
                console.log(chalk.yellow("\n⚠️ Warning: Could no dave authentication token."))
                console.log(
                    chalk.yellow("You may need to login again on next use.")
                )
            }
        
            //get the user data
            
            outro(chalk.green("Login Successful"))
            console.log(chalk.grey(`\n Token saved to: ${TOKEN_FILE}`))

            console.log(
                chalk.grey("You can now use AI commands without logging in again. \n")
            )
        
        }

    } catch (error) {
        spinner.stop()
        console.error(chalk.white("\nLogin Failed:"), error.message);
        process.exit(1)

        
    }


    async function pollForToken(authClient, device_code, client_id, intialIntervalValue) {
        let pollingInterval = intialIntervalValue
        const spinner = yoctoSpinner({
            text:"",color:"cyan"
        })
        let dots = 0;
        return new Promise((resolve, reject)=> {
            const poll = async () => {
                dots = (dots + 1) % 4;
                spinner.text = chalk.grey(`Polling for authorization${".".repeat(3 - dots)}`);

                if (!spinner.isSpinning) spinner.start();
                try {
                    const { data, error } = await authClient.device.token({
                        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                        
                        device_code:device_code,
                        client_id: clientId,
                         fetchOptions: {
                            headers: {
                                "user-agent": `My CLI`,
                                        },
                                    },
    
                    })
                    


                    if (data?.access_token) {
                        console.log(
                            chalk.bold.yellow(`Your access token: ${data.access_token}`)

                        )


                        spinner.stop();
                        resolve(data);
                        return;
                    }
                    else if (error) {   switch (error.error) {
                        case "authorization_pending":           
        // Continue polling
                            break;
                        case "slow_down":                            
                            pollingInterval += 5;                            
                            break;                        
                        case "access_denied":
                            console.error("Access was denied by the user");                            
                            return;                        
                        case "expired_token":                            
                            console.error("The device code has expired. Please try again.");                           
                            return
                        default:
                            spinner.stop()
                            logger.error(`Error: ${error.error_description}`);                            
                            process.exit(1)
                        
                    }
                        
                    }
                    
                }
                
                
                catch (error) {
                    spinner.stop()
                    logger.error(`Network Error:${err.message}`)
                    process.exit(1)
                }
                setTimeout(poll,pollingInterval* 1000)
            }       
            setTimeout(poll,pollingInterval*1000)
        }
    )}
    
}

//Logout

export async function logoutAction() {
    intro(chalk.bold("🙋Logout"));

    const token = await getStoredToken();

    if (!token) {
        console.log(chalk.yellow("you're not logged in."))
        process.exit(0)
    }

    const shouldLogout = await confirm({
        message: "Are u sure u want to logout?",
        initialValue:false,
    })

    if (isCancel(shouldLogout) || !shouldLogout) {
        cancel("Logout cancelled")
        process.exit(0)
    }

    const clear = await clearStoredToken();
    if (clear) {
        outro(chalk.green("Sucessfully logged out!"))

    }
    else {
        console.log(chalk.yellow("Could not clear token files!!"))
    }
    
}

//who am i

export async function whoamiAction(opts) {
    const token = await requireAuth();
    if (!token?.access_token) {
        console.log("No access token found. Please Login")
        process.exit(1)
    }
    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    token:token.access_token,
                },
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            image:true
        }
    })

    console.log(
        chalk.bold.greenBright(`\n---User:${user.name} \n---Email:${user.email} \n---ID:${user.id}
            `)
    )

}


//Command Setup----------->


export const login = new Command("login")
    .description("Login to Better Auth")
    .option("--Server url <url>", "The better auth server url", URL)
    .option("--Client-id <id>", "The oAuth client ID", CLIENT_ID)
    .action(loginAction)
    
 export const logout = new Command("logout")
    .description("Logout and clear stord crediantial to Better Auth")
   
    .action(logoutAction)
    
 export const whoami = new Command("whoami")
    .description("Show current authenticated user")
    .option("--Server url <url>", "The better auth server url", URL)

    .action(whoamiAction)
    