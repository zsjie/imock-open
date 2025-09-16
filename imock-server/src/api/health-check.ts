import httpStatus from 'http-status'
import { Context } from 'koa'
import Router from 'koa-joi-router'

import { Logger } from '~/lib/logger'
import prisma from '~/models/db'

const logger = new Logger('health-check')

export const healthCheck: Router.Config | Router.Spec = {
    validate: {},
    handler: async (ctx: Context) => {
        try {
            await prisma.$queryRaw`SELECT 1`
            ctx.status = httpStatus.OK
            ctx.body = 'Everything is fine' 
        } catch (error) {
            logger.error('Health check failed', error)
            ctx.status = httpStatus.INTERNAL_SERVER_ERROR
            ctx.body = error.message || error.msg || 'Internal Server Error'
        }
    }
}


