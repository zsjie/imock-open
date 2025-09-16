import { Prisma } from '@prisma/client'
import { isUndefined } from 'lodash'

import { getUrlHash } from '~/utils'

import prisma from './db'

export enum UserMockSource {
    Manual = 'manual',
    OpenAPI = 'openapi',
    AI = 'ai',
    AI_CACHE = 'ai_cache',
    AI_SWITCH = 'ai_mock_switch',
    AI_OVERRIDE = 'ai_override'
}

type MockApiInput = Omit<Prisma.userMocksCreateInput, 'running' | 'deleted'> & { id?: number }

export const listUserMocksWithPaging = async (
    userId: string,
    urlHash: string,
    method: string,
    offset = 0,
    limit = 20
) => {
    return await prisma.userMocks.findMany({
        where: {
            userId,
            urlHash,
            method,
            deleted: false,
            source: UserMockSource.Manual,
        },
        skip: offset,
        take: limit,
    })
}

export async function insertOrUpdateMockApi(data: MockApiInput) {
    const { id, userId, urlHash, method, ...updateData } = data

    if (!isUndefined(id)) {
        await prisma.userMocks.update({
            where: { id },
            data: updateData,
        })
    } else {
        await stopAllRunningMockApi(userId, urlHash, method)
        await prisma.userMocks.create({
            data: {
                ...data,
                running: true,
                deleted: false,
            },
        })
    }
}

export async function stopAllRunningMockApi(userId, urlHash, method) {
    await prisma.userMocks.updateMany({
        where: {
            userId,
            urlHash,
            method,
            running: true,
            source: UserMockSource.Manual,
        },
        data: {
            running: false,
        },
    })
}

export async function findMockApiByUrlAndMethod(userId, urlHash, method) {
    const mockApi = await prisma.userMocks.findMany({
        where: {
            userId,
            urlHash,
            method,
            deleted: false,
            source: UserMockSource.Manual,
        },
    })
    return mockApi
}

export function getRunningMockApi(userId, urlHash, method) {
    return prisma.userMocks.findFirst({
        where: {
            userId,
            urlHash,
            method,
            running: true,
            deleted: false,
            source: UserMockSource.Manual,
        },
    })
}

export function findUserMockById(id: number) {
    return prisma.userMocks.findFirst({
        where: {
            id,
            deleted: false,
        },
    })
}

export function startMockApi(id: number) {
    return prisma.userMocks.update({
        where: {
            id,
            deleted: false,
        },
        data: {
            running: true,
        },
    })
}

export function stopMockApi(id: number) {
    return prisma.userMocks.update({
        where: {
            id,
            deleted: false,
        },
        data: {
            running: false,
        },
    })
}

export function deleteMockApi(id: number) {
    return prisma.userMocks.update({
        where: {
            id,
        },
        data: {
            deleted: true,
        },
    })
}

export async function setDefaultMockApi(userId) {
    await prisma.userMocks.create({
        data: {
            userId,
            url: '/imock/todos',
            urlHash: getUrlHash('/imock/todos'),
            name: 'imock todos',
            headers: JSON.stringify({
                'content-type': 'application/json; charset=utf-8',
            }),
            body: JSON.stringify({
                data: [{
                    id: 0,
                    text: '1. 这是一条默认的 mock 数据',
                    completed: false,
                }, {
                    id: 1,
                    text: '2. 你可以在 imock 面板管理 mock 数据',
                    completed: false,
                }, {
                    id: 2,
                    text: '3. 你还可以点击下方按钮管理 mock 状态',
                    completed: false,
                }],
            }),
            statusCode: '200',
            method: 'GET',
            running: true,
            deleted: false,
            source: UserMockSource.Manual,
        }
    })
}

export async function findAIMockSwitch(userId, urlHash, method) {
    return prisma.userMocks.findFirst({
        where: {
            userId,
            urlHash,
            method,
            source: UserMockSource.AI_SWITCH,
        }
    })
}

export async function insertOrUpdateAIMockSwitch(data: MockApiInput) {
    const { id, ...updateData } = data

    if (!isUndefined(id)) {
        await prisma.userMocks.update({
            where: { id },
            data: updateData,
        })
    } else {
        await prisma.userMocks.create({
            data: {
                ...data,
                source: UserMockSource.AI_SWITCH,
            },
        })
    }
}

export async function findAIOverride(userId, urlHash, method) {
    return prisma.userMocks.findFirst({
        where: {
            userId,
            urlHash,
            method,
            source: UserMockSource.AI_OVERRIDE,
        }
    })
}

export async function insertOrUpdateAIOverride(data: MockApiInput) {
    const { id, ...updateData } = data

    if (!isUndefined(id)) {
        await prisma.userMocks.update({
            where: { id },
            data: updateData,
        })
    } else {
        await prisma.userMocks.create({
            data: {
                ...data,
                source: UserMockSource.AI_OVERRIDE,
            },
        })
    }
}

export async function isAIMockClosed(userId, urlHash, method) {
    const switchRecord = await findAIMockSwitch(userId, urlHash, method)
    return switchRecord && !switchRecord.aiMockRunning
}

export async function isAIMockOverride(userId, urlHash, method) {
    const overrideRecord = await findAIOverride(userId, urlHash, method)
    return overrideRecord?.aiOverride
}

export async function getResponseSchema(userId, urlHash, method) {
    const mockApi = await prisma.userMocks.findFirst({
        where: {
            userId,
            urlHash,
            method,
            source: UserMockSource.OpenAPI,
        }
    })
    return mockApi?.responseSchema
}

export async function setAIMockBody(userId, url, urlHash, method, body) {
    const existingRecord = await prisma.userMocks.findFirst({
        where: { userId, urlHash, method, source: UserMockSource.AI_CACHE }
    })

    if (existingRecord) {
        await prisma.userMocks.update({
            where: { id: existingRecord.id },
            data: { aiMockBody: body }
        })
    } else {
        await prisma.userMocks.create({
            data: {
                userId,
                url,
                urlHash,
                method,
                source: UserMockSource.AI_CACHE,
                aiMockBody: body
            }
        })
    }
}

export async function getAIMockBody(userId, urlHash, method) {
    const mockApi = await prisma.userMocks.findFirst({
        where: { userId, urlHash, method, source: UserMockSource.AI_CACHE }
    })
    return mockApi?.aiMockBody
}

export async function deleteAIMockBody(userId, urlHash, method) {
    await prisma.userMocks.deleteMany({
        where: { userId, urlHash, method, source: UserMockSource.AI_CACHE }
    })
}
