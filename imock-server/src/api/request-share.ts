import httpStatus from 'http-status'
import Router, { Joi } from 'koa-joi-router'
import { omit } from 'lodash'

import ApiError from '~/lib/error/api-error'
import checkLogin from '~/middlewares/check-login'
import { RequestShare, RequestShareData } from '~/models/request-share'
import { getOrigin } from '~/utils/env'

const router = Router()

// 获取分享内容
router.route({
    method: 'get',
    path: '/share-url/:shareId',
    validate: {
        params: {
            shareId: Joi.string().required()
        }
    },
    handler: async (ctx) => {
        const { shareId } = ctx.params

        const share = await RequestShare.getShare(shareId)
        if (!share) {
            ctx.status = 404
            ctx.body = {
                code: 404,
                message: '分享不存在或已过期',
                data: null
            }
            return
        }

        ctx.body = share.data
    }
})

router.use(checkLogin)

// 创建分享链接
router.route({
    method: 'post',
    path: '/share-url',
    validate: {
        type: 'json',
        body: Joi.object({
            url: Joi.string().required().description('请求URL'),
            method: Joi.string().required().description('请求方法'),
            requestBody: Joi.any().description('请求体'),
            responseBody: Joi.any().description('响应体'),
            status: Joi.number().required().description('HTTP状态码'),
            requestHeaders: Joi.object().required().description('请求头'),
            responseHeaders: Joi.object().required().description('响应头'),
            requestTime: Joi.number().required().description('请求时间戳'),
            responseTime: Joi.number().required().description('响应时间戳')
        }).required()
    },
    handler: async (ctx) => {
        const { userId } = ctx.state.user
        const shareData: RequestShareData = ctx.request.body

        const authHeaders = ['authorization', 'cookie', 'set-cookie']
        const privateHeaders = ['x-imock-id', 'x-mocked-by-imock-ai', 'x-mocked-by-imock', 'x-imock-backend-url', 'x-imock-backend-env']

        if (shareData.requestHeaders) {
            shareData.requestHeaders = omit(shareData.requestHeaders, privateHeaders)

            for (const key in shareData.requestHeaders) {
                if (authHeaders.includes(key.toLowerCase())) {
                    shareData.requestHeaders[key] = '******'
                }
            }
        }

        if (shareData.responseHeaders) {
            shareData.responseHeaders = omit(shareData.responseHeaders, privateHeaders)
            for (const key in shareData.responseHeaders) {
                if (authHeaders.includes(key.toLowerCase())) {
                    shareData.responseHeaders[key] = '******'
                }
            }
        }

        try {
            const share = await RequestShare.createShare(userId, shareData)
            
            ctx.body = {
                shareId: share.shareId,
                expiredAt: share.expiredAt,
                shareUrl: `${getOrigin()}/share/${share.shareId}`
            }    
        } catch (error) {
            throw new ApiError('创建分享失败', httpStatus.INTERNAL_SERVER_ERROR)
        }
    }
})

export default router 