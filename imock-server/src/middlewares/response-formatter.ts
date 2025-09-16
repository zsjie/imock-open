import httpStatus from 'http-status'
import { Context, Next } from 'koa'

import { Logger } from '~/lib/logger'

const logger = new Logger('response-formatter')

const responseFormatter = async (ctx: Context, next: Next) => {
    try {
        await next()


        // 如果响应体已经存在，则格式化响应体
        if (ctx.status === httpStatus.OK) {
            if (ctx.body) {
                ctx.body = {
                    code: 0,
                    msg: 'success',
                    data: ctx.body
                }
            } else {
                // 如果响应体不存在，则返回一个默认的响应体
                ctx.body = {
                    code: 0,
                    msg: 'success',
                    data: {}
                }
            }
        } else {
            // 如果响应状态码不是 200，则返回一个错误响应体
            ctx.body = {
                code: ctx.status,
                msg: ctx.message,
                data: {}
            }
        }
    } catch (err) {
        logger.error(err)

        // 处理错误并返回格式化的错误响应
        ctx.status = err.status || httpStatus.INTERNAL_SERVER_ERROR
        ctx.body = {
            code: err.status || httpStatus.INTERNAL_SERVER_ERROR,
            msg: err.message || 'Internal Server Error',
            data: {}
        }
    }
}

export default responseFormatter
