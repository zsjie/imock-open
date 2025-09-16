import prisma from './db'


export function createToken(data: {
    userId: string,
    token: string,
    expiresAt: Date,
    source: string,
    deviceId: string,
}) {
    return prisma.authToken.create({
        data,
    })
}

export async function isTokenValid(token: string) {
    const record = await prisma.authToken.findUnique({
        where: {
            token,
            expiresAt: {
                gte: new Date(),
            }
        },
    })

    return !!record
}

export async function findUserByToken(token: string) {
    const record = await prisma.authToken.findUnique({
        where: {
            token,
            expiresAt: {
                gte: new Date(),
            }
        },
        include: {
            user: true,
        }
    })

    return record?.user
}

export async function deleteToken(token: string) {
    return prisma.authToken.delete({
        where: {
            token,
        }
    })
}


