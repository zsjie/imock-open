import httpStatus from 'http-status'

import { Logger } from '~/lib/logger'
import mockWithQwen from '~/lib/qwen'
import { findRunningMockUrls } from '~/models/mock-urls'
import { getAIMockBody, getResponseSchema, isAIMockClosed, setAIMockBody } from '~/models/user-mocks'
import { getMockIdFromHeaders, getUrlHash, getUrlPath, isProxyApi, safeParse } from '~/utils'
import { formatMockResponseBody } from '~/utils/mockjs'

import { emitRequestEvent } from './utils'

const logger = new Logger('mock-request-with-ai')

const checkUseMockCache = (cacheHeaders: Record<string, string>) => {
    const useMockCache = cacheHeaders['x-imock-use-cache']
    return useMockCache !== 'false'
}

const mockWithAI = () => async (ctx, next) => {
    const url = ctx.request.url
    if (!isProxyApi(url)) {
        return next()
    }

    const mockId = getMockIdFromHeaders(ctx.request.headers)
    if (!mockId) {
        logger.info('no mock id found. will skip')
        return next()
    }

    const { isMocked, isProxy } = ctx.state
    if (isMocked || isProxy) {
        return next()
    }

    // AI Mock 功能已开放，无需限制检查

    const { originalUrl, method } = ctx

    const urlPath = getUrlPath(originalUrl)
    const urlHash = getUrlHash(originalUrl)
    const aiMockClosed = await isAIMockClosed(mockId, urlHash, method)

    if (aiMockClosed) {
        // 没有设置 mock，没有 fallback url，还关闭了 ai mock
        logger.info('no target url found for mockId: ', mockId, '. will skip')
        ctx.status = httpStatus.NOT_FOUND
        ctx.body = {
            data: null,
            message: httpStatus['404_MESSAGE'],
            code: httpStatus.NOT_FOUND,
        }

        emitRequestEvent(ctx, Date.now())
        return next()
    }

    const useMockCache = checkUseMockCache(ctx.request.headers)
    if (useMockCache) {
        const aiMockBody = await getAIMockBody(mockId, urlHash, method)
        if (aiMockBody) {
            ctx.set('x-mocked-by-imock-ai', 'true')
            const mockUrl = await findRunningMockUrls(mockId)
            if (mockUrl) {
                ctx.set('x-imock-backend-url', mockUrl.url)
            }
            const _body = formatMockResponseBody(aiMockBody)
            ctx.body = _body

            emitRequestEvent(ctx, Date.now())
            return next()
        }
    }

    const responseSchema = await getResponseSchema(mockId, urlHash, method)

    const prompt = getMockPrompt(method, originalUrl, JSON.stringify(ctx.request.body), responseSchema || '')
    logger.info('🚀 ~ mockWithAI ~ prompt:', prompt)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockData: any = await mockWithQwen(prompt)
    logger.info('ai res:', mockData)

    try {
        mockData = safeParse(mockData || '{}')
    } catch (error) {
        logger.error('parse ai res error:', error)
    }

    const ctxBody = mockData

    await setAIMockBody(mockId, urlPath, urlHash, method, JSON.stringify(ctxBody))

    const _body = formatMockResponseBody(ctxBody)
    ctx.set('x-mocked-by-imock-ai', 'true')
    const mockUrl = await findRunningMockUrls(mockId)
    if (mockUrl) {
        ctx.set('x-imock-backend-url', mockUrl.url)
    }

    ctx.body = _body

    emitRequestEvent(ctx, Date.now())
}

function getMockPrompt(method: string, originalUrl: string, requestBody: string, responseSchema?: string) {
    const basePrompt = `Please generate JSON data with camelCase style based on the following request information:
Request method: ${method}
Request path: ${originalUrl}${['POST', 'PUT'].includes(method) && requestBody ? `
Request parameters: ${requestBody}` : ''}`

    const imageRules = `
8. If a object can have a image, add a image field to the object;
9. When generating a image url, please use a placeholder: @image;
10. When generating a image url of goods/product, please use a placeholder: @goodsImage;
11. when generate a avatar url of user, please use a placeholder: @avatar;
12. when generate a image of a post, please use a placeholder: @postImage;`

    const commonRules = `
IMPORTANT：1.Generate JSON data only without any explanation, comments or other text;
2. the JSON object should be with the following format: { "code": 0, "message": "success", "data": {} };
3. Do not use \`\`\`json to wrap the output, just output the JSON string;
4. If you need to generate text fields, please use Chinese characters;
5. when generate a unique ID, please use the @id placeholder to represent it, such as id, user_id, order_id, product_id, etc.
6. If the request contains pagination parameters like 'pageSize' or 'limit', generate the corresponding number of objects, but no more than 10 objects;
7. If a object can have a image, add a image field to the object;`

    if (responseSchema) {
        return `${basePrompt}
Response data structure definition: ${responseSchema}
${commonRules}${imageRules}`
    }

    return `${basePrompt}
${commonRules}${imageRules}`
}

export default mockWithAI
