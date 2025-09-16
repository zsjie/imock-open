import prisma from './db'
import { MockEnv } from './type'

export function upsertMockUrl(data: {
    userId: string,
    url: string,
    env: string,
}) {
    return prisma.mockUrls.upsert({
        where: {
            // eslint-disable-next-line camelcase
            userId_env: {
                userId: data.userId,
                env: data.env,
            }
        },
        update: {
            url: data.url,
        },
        create: data,
    })
}

export function findMockUrls(userId: string) {
    return prisma.mockUrls.findMany({
        where: {
            userId,
        },
    })
}

export function findRunningMockUrls(userId: string, env?: MockEnv) {
    return prisma.mockUrls.findFirst({
        where: {
            userId,
            running: true,
            env: env || MockEnv.TEST,
        },
    })
}

export function updateRunningMockUrl(userId: string, env: string, running: boolean) {
    return prisma.mockUrls.update({
        where: {
            // eslint-disable-next-line camelcase
            userId_env: {
                userId,
                env,
            }
        },
        data: {
            running,
        },
    })
}

export function stopRunningMockUrlByEnv(userId: string, env: string) {
    return prisma.mockUrls.updateMany({
        where: {
            userId,
            env,
            running: true,
        },
        data: {
            running: false,
        },
    })
}

export function startMockUrlByEnv(userId: string, env: string) {
    return prisma.mockUrls.updateMany({
        where: {
            userId,
            env,
        },
        data: {
            running: true,
        },
    })
}

export function stopAllRunningMockUrls(userId: string) {
    return prisma.mockUrls.updateMany({
        where: {
            userId,
            running: true,
        },
        data: {
            running: false,
        },
    })
}
