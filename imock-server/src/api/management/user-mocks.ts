import httpStatus from 'http-status'
import { Context } from 'koa'
import Router, { Joi } from 'koa-joi-router'
import { isString, pick } from 'lodash'
import { OpenAPIV3 } from 'openapi-types'

import ApiError from '~/lib/error/api-error'
import { Logger } from '~/lib/logger'
import * as MockUrls from '~/models/mock-urls'
import * as UserMocks from '~/models/user-mocks'
import { getUrlHash, getUrlPath, removeImockHeaders } from '~/utils'
import { md5 } from '~/utils/hash'
import { getResponseExample } from '~/utils/openapi'

const userMockApis = Router()

const logger = new Logger('api/user-mocks')

userMockApis.route({
    path: '/',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            id: Joi.number().description('mock id'),
            url: Joi.string().required().description('mock url'),
            name: Joi.string().description('mock name').allow('').default(''),
            headers: Joi.string().required().description('mock headers'),
            body: Joi.string().description('mock body').default(''),
            status: Joi.string().default('200').length(3).description('mock status'),
            method: Joi.string().default('GET').description('mock method'),
            delay: Joi.number().default(0).description('接口延迟，单位 ms'),
        },
    },
    handler: async (ctx: Context) => {
        const { userId } = ctx.state.user
        const { url, name, headers, body, id, status, method, delay } = ctx.request.body
        try {
            const urlHash = getUrlHash(url)
            await UserMocks.insertOrUpdateMockApi({
                userId,
                urlHash,
                url: getUrlPath(url),
                name: (name || url).substring(0, 32),
                headers: removeImockHeaders(headers),
                body,
                id,
                statusCode: status,
                method,
                delay,
                source: UserMocks.UserMockSource.Manual,
            })
            ctx.body = {}
        } catch (err) {
            logger.error('insertOrUpdateMockApi error:', err)
            throw err
        }
    },
})

/**
 * 查询接口的 mocks，支持分页
 */
userMockApis.route({
    path: '/',
    method: 'get',
    validate: {
        query: {
            url: Joi.string().default('').description('mock url'),
            method: Joi.string().default('GET').description('mock method'),
            offset: Joi.number().default(0).description('offset'),
            limit: Joi.number().default(20).description('limit'),
        }
    },
    handler: async (ctx: Context) => {
        const { url, method, offset, limit } = ctx.request.query as unknown as {
            url: string,
            method: string,
            offset: number,
            limit: number,
        }
        const { userId } = ctx.state.user
        const mocks = await UserMocks.listUserMocksWithPaging(userId, md5(url), method, offset, limit)
        ctx.body = {
            hasMore: mocks.length === limit,
            mocks,
            offset: offset + mocks.length,
        }
    },
})

/**
 * 设置 mock url
 */
userMockApis.route({
    path: '/set-mock-url',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            urls: Joi.array().items({
                url: Joi.string().required().description('mock url'),
                env: Joi.string().default('test').allow('dev', 'test', 'pre', 'prod').description('mock env'),
            }).required().description('mock urls'),
        },
    },
    handler: async (ctx: Context) => {
        const { userId } = ctx.state.user
        const { urls } = ctx.request.body

        for (const { url, env } of urls) {
            await MockUrls.upsertMockUrl({
                userId,
                url,
                env,
            })
        }

        ctx.body = {}
    },
})

userMockApis.route({
    path: '/list-mock-url',
    method: 'get',
    handler: async (ctx: Context) => {
        const { userId } = ctx.state.user
        const urls = await MockUrls.findMockUrls(userId)

        ctx.body = {
            urls: urls.map(url => pick(url, ['url', 'env', 'running'])),
        }
    },
})

/**
 * 启动 mock
 */
userMockApis.route({
    path: '/start/:id',
    method: 'post',
    validate: {},
    handler: async (ctx: Context) => {
        const { userId } = ctx.state.user
        const { id } = ctx.request.params

        try {
            const currentMock = await UserMocks.findUserMockById(parseInt(id))
            if (!currentMock) {
                ctx.status = 404
                ctx.body = {
                    code: 404,
                    msg: 'Not Found',
                    data: null,
                }
                return
            }

            const { url, method } = currentMock
            await UserMocks.stopAllRunningMockApi(userId, md5(url), method)

            // 启动当前 mock
            await UserMocks.startMockApi(currentMock.id)

            ctx.body = {}
        } catch (err) {
            logger.error('start mock error:', err)
            throw err
        }
    },
})

/**
 * 停止 mock
 */
userMockApis.route({
    path: '/stop/:id',
    method: 'post',
    validate: {},
    handler: async (ctx: Context) => {
        const { id } = ctx.request.params

        try {
            const currentMock = await UserMocks.findUserMockById(parseInt(id))
            if (!currentMock) {
                ctx.status = 404
                ctx.body = {
                    code: 404,
                    msg: 'Not Found',
                    data: null,
                }
                return
            }

            // 启动当前 mock
            await UserMocks.stopMockApi(parseInt(id))

            ctx.body = {}
        } catch (err) {
            logger.error('stop mock error:', err)
            throw err
        }
    },
})

/**
 * 停止 mock
 */
userMockApis.route({
    path: '/:id',
    method: 'delete',
    validate: {},
    handler: async (ctx: Context) => {
        const { id } = ctx.request.params

        try {
            await UserMocks.deleteMockApi(parseInt(id))

            ctx.body = {}
        } catch (err) {
            logger.error('delete mock error:', err)
            throw err
        }
    },
})

// 添加新的路由处理导入 OpenAPI
userMockApis.route({
    path: '/import-openapi',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            openapi: Joi.object().required().description('OpenAPI 文档对象'),
        },
    },
    handler: async (ctx: Context) => {
        const { userId } = ctx.state.user
        const { openapi } = ctx.request.body

        try {
            const document = openapi as OpenAPIV3.Document
            const paths = document.paths || {}

            // 遍历所有路径和方法
            for (const [path, pathItem] of Object.entries(paths)) {
                console.log(path, pathItem)
                for (const [method, operation] of Object.entries(pathItem || {})) {
                    if (!operation || isString(operation) || method === 'parameters') continue

                    const op = operation as OpenAPIV3.OperationObject

                    for (const [status, response] of Object.entries(op.responses || {})) {
                        const example = getResponseExample(response as OpenAPIV3.ResponseObject)
                        const urlHash = getUrlHash(path)
                    
                        await UserMocks.insertOrUpdateMockApi({
                            id: undefined,
                            userId,
                            urlHash,
                            url: getUrlPath(path),
                            name: op.summary || path,
                            headers: JSON.stringify({
                                'content-type': 'application/json; charset=utf-8',
                            }),
                            body: JSON.stringify(example),
                            statusCode: status,
                            method: method.toUpperCase(),
                            delay: 0,

                            description: op.description,
                            requestSchema: JSON.stringify((op.requestBody && 'content' in op.requestBody ? 
                                op.requestBody?.content?.['application/json']?.schema : 
                                undefined)),
                            responseSchema: JSON.stringify((response && 'content' in response ? 
                                response.content?.['application/json']?.schema : 
                                undefined)),
                            source: UserMocks.UserMockSource.OpenAPI,
                            sourceVersion: document.openapi,
                        })

                        await UserMocks.deleteAIMockBody(userId, urlHash, method)
                    }
                }
            }

            ctx.body = {
                message: '导入成功'
            }
        } catch (err) {
            logger.error('import openapi error:', err)
            throw err
        }
    },
})

userMockApis.route({
    path: '/ai-mock-switch',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            url: Joi.string().required().description('mock url'),
            method: Joi.string().default('GET').description('mock method'),
            aiMockRunning: Joi.boolean().required().description('ai mock switch'),
        },
    },
    handler: async (ctx: Context) => {
        const { userId } = ctx.state.user
        const { url, method, aiMockRunning } = ctx.request.body
        try {
            const urlHash = getUrlHash(url)
            const urlPath = getUrlPath(url)
            const fallbackUrl = await MockUrls.findRunningMockUrls(userId)
            if (fallbackUrl && aiMockRunning) {
                const aiOverrideRecord = await UserMocks.findAIOverride(userId, urlHash, method)
                await UserMocks.insertOrUpdateAIOverride({
                    id: aiOverrideRecord?.id,
                    userId,
                    urlHash,
                    url: urlPath,
                    method,
                    aiOverride: aiMockRunning,
                })
            }

            const runningMock = await UserMocks.getRunningMockApi(userId, urlHash, method)
            if (runningMock && aiMockRunning) {
                await UserMocks.stopMockApi(runningMock.id)
            }

            const switchRecord = await UserMocks.findAIMockSwitch(userId, urlHash, method)
            await UserMocks.insertOrUpdateAIMockSwitch({
                id: switchRecord?.id,
                userId,
                urlHash,
                url: urlPath,
                method,
                aiMockRunning,
            })

            ctx.body = {}
        } catch (err) {
            logger.error('insertOrUpdateAIMockSwitch error:', err)
            throw err
        }
    },
})

/**
 * 切换 mock URL 环境
 */
userMockApis.route({
    path: '/switch-env',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            enableEnv: Joi.string().required().allow('dev', 'test', 'pre', 'prod', 'none').description('要启用的环境'),
        },
    },
    handler: async (ctx: Context) => {
        const { userId } = ctx.state.user
        const { enableEnv } = ctx.request.body

        if (enableEnv === 'none') {
            await MockUrls.stopAllRunningMockUrls(userId)
            ctx.body = {}
            return
        }

        try {
            // 先停止所有环境的mock URLs
            const mockUrls = await MockUrls.findMockUrls(userId)
            for (const mockUrl of mockUrls) {
                await MockUrls.updateRunningMockUrl(userId, mockUrl.env, false)
            }
            
            // 启用指定环境的mock URLs
            await MockUrls.startMockUrlByEnv(userId, enableEnv)
            
            ctx.body = {}
        } catch (err) {
            logger.error('switchMockUrlEnv error:', err)
            throw new ApiError('切换环境失败', httpStatus.INTERNAL_SERVER_ERROR)
        }
    },
})

export default userMockApis
