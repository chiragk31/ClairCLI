CLAIR-CLI

--Project Initialization
-Create Client(npx create-next-app@latest,npx shadcn@latest init,npx shadcn@latest add)
-Create Server(npm init --y,npm i express dotenv cors)
-Install nextjs with shadcn 
-Init express in Server

--DataBase
-Install prisma and prisma Client(npm i prisma @prisma/client,After Crating a table(npx prisma migrate dev))
-get db url from neon db-Make a test migration


/src/lib/db.js
(
    import { PrismaClient } from "@prisma/client"

const globalForPrisma = global
const prisma = new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma
) refer documentation for pprisma this is for optimization practices this is prisma singelton instance





