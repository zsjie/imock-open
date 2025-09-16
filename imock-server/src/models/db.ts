import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasourceUrl: process.env.MYSQL_URL,
})

export default prisma
