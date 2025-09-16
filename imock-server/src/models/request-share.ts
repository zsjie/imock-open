import dayjs from 'dayjs'
import { nanoid } from 'nanoid'

import prisma from './db'

export interface RequestShareData {
    url: string
    method: string
    requestBody: unknown
    responseBody: unknown
    status: number
    requestHeaders: Record<string, string>
    responseHeaders: Record<string, string>
    requestTime: number
    responseTime: number
}

export class RequestShare {
    static async createShare(userId: string, data: RequestShareData) {
        const shareId = nanoid(10) // 生成10位分享ID
        const expiredAt = dayjs().add(7, 'day').toDate() // 7天后过期

        return prisma.requestShare.create({
            data: {
                shareId,
                userId,
                data: JSON.stringify(data),
                expiredAt,
                createdAt: new Date()
            }
        })
    }

    static async getShare(shareId: string) {
        const share = await prisma.requestShare.findFirst({
            where: {
                shareId,
                expiredAt: {
                    gt: new Date() // 未过期
                }
            }
        })

        if (!share) {
            return null
        }

        return {
            ...share,
            data: JSON.parse(share.data)
        }
    }

    static async deleteExpiredShares() {
        return prisma.requestShare.deleteMany({
            where: {
                expiredAt: {
                    lt: new Date()
                }
            }
        })
    }
} 