CLAIR-CLI

--Project Initialization
-Create Client(npx create-next-app@latest,npx shadcn@latest init,npx shadcn@latest add)
-Create Server(npm init --y,npm i express dotenv cors)
-Install nextjs with shadcn 
-Init express in Server

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
