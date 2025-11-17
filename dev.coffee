CLAIR-CLI

#1 Initial setup

--Project Initialization
-Create Client(npx create-next-app@latest,npx shadcn@latest init,npx shadcn@latest add)
-Create Server(npm init --y,npm i express dotenv cors)
-Install nextjs with shadcn 
-Init express in Server


#2 data base using orm-prisma and neon db then has plan to use better auth queris and then migrate using prisma
--DataBase(neon.com get connect-get url)
-Install prisma and prisma Client(npm i prisma @prisma/client,After Crating a table(npx prisma migrate dev))
-get db url from neon db-Make a test migration

-For Migration(npx prisma migrate dev)

/src/lib/db.js
(
    import { PrismaClient } from "@prisma/client"

const globalForPrisma = global
const prisma = new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma
) refer documentation for pprisma this is for optimization practices this is prisma singelton instance


#3 Better auth setup and some playaround

--Auth using better-Auth(better-auth.com)
-Install Better-Auth(npm install better-auth--in server)
-Setup better auth into express
-Make login and home page using
-Implement authclient in nextjs


--Use Github O Auth in the Project
add this in auth.js(
        socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret:process.env.GITHUB_CLIENT_SECRET
        }
    }
)
add in indexjs

import { betterAuth } from "better-auth"
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

-in the client(npm i better-auth)

#4 Device flow for authentication using better auth
--Implement deviceFlow
--it is used for the application with no browser
-Implement it with deviceflow plugin using better auth
-Create device and approve page in client 
-write logic to save access token

npm i commander chalk boxen yocto-spinner @clack/prompts figlet

(chalk for adding multiple colors, yocto-spinner for adding box diagrams , figlet to add banners)


in git bash----
cd server
chmod +x src/cli/main.js
npm link

in package.json below main
add(
    "bin"{
        "clair":"./src/cli/main.js"
    }
)
{this line is important in main.js from where the command is being created}
#!/usr/bin/env node  


#5 Configuration
--Implement Google ai service(Initially for chat bot then will try for making application)
(npm i ai)
(npm install @ai-sdk/google)
follow the doc of ai sdk google generative
-Install ai-sdk in backend
-config google ai
-Init AI service



#6 Define Chat feature

#7 Tool calling implementation may be add pyhon compiler and any other tool 

#8 Agentic Ai mode implementaion