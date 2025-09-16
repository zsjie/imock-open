import prisma from './db'

export function findCodeInOneMinute(email: string) {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    return prisma.emailCode.findFirst({
        where: {
            email,
            createdAt: {
                gte: oneMinuteAgo,
            }
        }
    })
}

export function deleteCode(email: string, code: string) {
    return prisma.emailCode.deleteMany({
        where: {
            email,
            code,
        }
    })
}

export function createCode(email: string, code: string) {
    return prisma.emailCode.create({
        data: {
            email,
            code,
        }
    })
}

export async function isCodeValidInFiveMins(email: string, code: string) {
    const now = new Date()
    const fiveMinuteAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const latestCode = await prisma.emailCode.findFirst({
        where: {
            email,
            code,
            createdAt: {
                gte: fiveMinuteAgo,
            }
        },
    })

    return !!latestCode
}
