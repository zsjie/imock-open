import { Logger } from '~/lib/logger'
import { findRunningMockUrls } from '~/models/mock-urls'
import { getRunningMockApi } from '~/models/user-mocks'
import { formatProxyUrl, getMockIdFromHeaders, getUrlHash, isProxyApi, safeParse, sleep } from '~/utils'
import { formatMockResponseBody } from '~/utils/mockjs'

import { emitRequestEvent } from './utils'

const logger = new Logger('mock-request')

const mockRequest = () => async (ctx, next) => {
    try {
        const url = ctx.request.url
        if (!isProxyApi(url)) {
            return next()
        }

        const mockId = getMockIdFromHeaders(ctx.request.headers)
        if (!mockId) {
            logger.info('no mock id found. will skip')
            return next()
        }

        ctx.state.mockId = mockId
        const { originalUrl, method } = ctx
        logger.info('find mock with:', method, formatProxyUrl(originalUrl)?.split('?')[0])

        const mockApi = await getRunningMockApi(ctx.state.mockId, getUrlHash(originalUrl), method)
        const startTime = Date.now()

        if (mockApi) {
            logger.info('running mock found: ', method, formatProxyUrl(originalUrl)?.split('?')[0])

            const { statusCode, headers, body, delay } = mockApi
            if (headers) {
                const parsedHeaders = safeParse(headers)
                Object.entries(parsedHeaders).forEach(([key, value]) => {
                    ctx.set(key, value)
                })
            }

            ctx.set('x-mocked-by-imock', 'true')
            const mockUrl = await findRunningMockUrls(mockId)
            if (mockUrl) {
                ctx.set('x-imock-backend-url', mockUrl.url)
            }

            if (delay) {
                await sleep(delay)
            }

            const _body = formatMockResponseBody(body || '')
            ctx.status = parseInt(statusCode || '200')
            ctx.body = _body
            ctx.state.isMocked = true
            
            emitRequestEvent(ctx, startTime)
        } else {
            logger.info('no mock found: ', method, formatProxyUrl(originalUrl)?.split('?')[0], '. will skip')
            return next()
        }
    } catch (error) {
        logger.log(error)
        return next()
    }
}

export default mockRequest
