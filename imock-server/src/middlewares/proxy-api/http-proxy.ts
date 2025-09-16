import zstd from '@mongodb-js/zstd'
import axios, { AxiosError } from 'axios'
import httpStatus from 'http-status'
import { Next } from 'koa'
import { promisify } from 'util'
import zlib from 'zlib'

import { Logger } from '~/lib/logger'
import { findRunningMockUrls } from '~/models/mock-urls'
import { isAIMockOverride } from '~/models/user-mocks'
import { formatTargetUrl, getMockIdFromHeaders, getUrlHash, isProxyApi } from '~/utils'

import { emitRequestEvent } from './utils'

const logger = new Logger('http-proxy')

// 将 zlib 的方法转换为 Promise
const gunzip = promisify(zlib.gunzip)
const inflate = promisify(zlib.inflate)
const brotliDecompress = promisify(zlib.brotliDecompress)

const mockProxyCore = () => {
    return async (ctx, next: Next) => {
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

        if (ctx.state.isMocked) {
            return next()
        }

        const { originalUrl, method } = ctx
        const aiMockOverride = await isAIMockOverride(mockId, getUrlHash(originalUrl), method)
        if (aiMockOverride) {
            return next()
        }

        const mockUrl = await findRunningMockUrls(mockId)
        if (!mockUrl) {
            return next()
        }

        const startTime = Date.now()

        try {
            // 构建目标 URL
            const targetUrl = formatTargetUrl(mockUrl.url, ctx.request.url)

            const requestHeadersToRemove = [
                'x-forwarded-for',
                'x-real-ip',
                'x-imock-id',
                'host'  // 先删除原有的 host
            ]
            const requestHeaders = { ...ctx.request.headers }
            requestHeadersToRemove.forEach(header => delete requestHeaders[header])

            // 准备请求配置
            const requestConfig = {
                method: ctx.method,
                url: targetUrl,
                headers: requestHeaders,
                data: ctx.request.body,
                validateStatus: () => true,
                maxRedirects: 5,
                timeout: 60000,
                responseType: 'arraybuffer' as const,
                decompress: false,
            }
            logger.info('proxy request config:', requestConfig)

            // 发送请求
            const response = await axios(requestConfig)

            // 设置响应状态码
            ctx.status = response.status
            ctx.set('x-imock-backend-env', mockUrl.env)
            ctx.set('x-imock-backend-url', mockUrl.url)

            logger.info('proxy response status:', response.status)

            // 如果是 304，直接返回，不处理响应体
            if (response.status === 304) {
                logger.info('proxy response status is 304. will not process response body')
                ctx.__customResponse = ''
                emitRequestEvent(ctx, startTime)
                return next()
            }

            // 处理响应体
            let responseBody = response.data
            const contentEncoding = response.headers['content-encoding']
            
            // 根据 content-encoding 解压响应
            try {
                if (contentEncoding) {
                    logger.info('Decompressed response with encoding:', contentEncoding)
                } else {
                    logger.info('No content encoding found. will not decompress')
                }

                if (contentEncoding === 'gzip') {
                    responseBody = await gunzip(responseBody)
                } else if (contentEncoding === 'deflate') {
                    responseBody = await inflate(responseBody)
                } else if (contentEncoding === 'br') {
                    responseBody = await brotliDecompress(responseBody)
                } else if (contentEncoding === 'zstd') {
                    responseBody = await zstd.decompress(responseBody)
                }
            } catch (error) {
                logger.error('Failed to decompress response:', error, 'encoding:', contentEncoding)
            }

            // 设置响应头（在解压后设置）
            const headers = { ...response.headers }
            const headersToRemove = [
                // 缓存相关的头
                'cache-control',
                'expires',
                'pragma',
                'etag',
                'last-modified',
                'if-modified-since',

                // 压缩相关的头
                'content-encoding',  // 移除压缩相关的头
                'content-length',    // 内容长度会改变
                'transfer-encoding'  // 传输编码可能改变
            ]
            headersToRemove.forEach(header => delete headers[header])
            Object.entries(headers).forEach(([key, value]) => {
                ctx.set(key, value as string)
            })

            // 如果是 JSON 响应，尝试解析
            const contentType = response.headers['content-type'] || ''
            if (contentType.includes('application/json')) {
                try {
                    responseBody = JSON.parse(responseBody.toString())
                } catch (error) {
                    logger.error('Failed to parse JSON response:', error)
                }
            }

            logger.info('response body:', responseBody)
            ctx.body = responseBody
            ctx.__customResponse = responseBody
            
            // 发送请求事件
            emitRequestEvent(ctx, startTime)

        } catch (error) {
            logger.error('Proxy request failed:', error)
            
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError
                ctx.status = axiosError.response?.status || httpStatus.INTERNAL_SERVER_ERROR
                ctx.body = {
                    data: null,
                    msg: axiosError.message,
                    code: axiosError.code,
                }
            } else {
                ctx.status = httpStatus.INTERNAL_SERVER_ERROR
                ctx.body = {
                    data: null,
                    msg: 'Internal Server Error',
                    code: httpStatus.INTERNAL_SERVER_ERROR,
                }
            }

            ctx.__customResponse = ctx.body

            emitRequestEvent(ctx, startTime)
        }

        ctx.state.isProxy = true
        return next()
    }
}

export default mockProxyCore
