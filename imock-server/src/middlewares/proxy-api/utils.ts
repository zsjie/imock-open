import Koa from 'koa'
import { omit } from 'lodash'

import { Logger } from '~/lib/logger'
import { formatProxyUrl } from '~/utils'

const logger = new Logger('emit-request-event')

const getRealHost = (ctx: Koa.Context) => {
    return ctx.get('x-forwarded-host') || ctx.host
}

export function emitRequestEvent(ctx, startTime: number) {
    const realHost = getRealHost(ctx)

    const param = {
        url: formatProxyUrl(ctx.originalUrl),
        method: ctx.method,
        requestBody: ctx.request.body,
        responseBody: ctx.__customResponse || ctx.body, // 使用一个自定义属性来存储响应数据
        status: ctx.status,
        requestHeaders: {
            ...omit(ctx.request.headers, [
                'x-forwarded-for',
                'x-real-ip',
                'x-forwarded-host',
                'x-imock-use-cache'
            ]),
            host: realHost,
        }, // 添加请求头
        responseHeaders: ctx.response.headers, // 添加响应头
        requestTime: startTime,
        responseTime: new Date().getTime(),
    }

    const mockId = ctx.state.mockId
    if (mockId) {
        const eventKey = `request:${mockId}`
        logger.info(`emit request - event key: ${eventKey}, data: ${JSON.stringify(param)}`)
        ctx.io?.emit(eventKey, param)
    }
}