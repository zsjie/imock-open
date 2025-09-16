import crypto from 'crypto'
import HTTP_STATUS from 'http-status'
import jwt from 'jsonwebtoken'
import Router, { Joi } from 'koa-joi-router'

import emailService from '~/lib/email'
import ApiError from '~/lib/error/api-error'
import { Logger } from '~/lib/logger'
import checkLogin from '~/middlewares/check-login'
import * as authTokenModel from '~/models/auth-token'
import * as emailCodeModel from '~/models/email-otp'
import * as userModel from '~/models/user'
import { setDefaultMockApi } from '~/models/user-mocks'
import { isDev } from '~/utils/env'
import { generateDeviceId, generateVerifyCode } from '~/utils/random'

const logger = new Logger('auth')

const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex')
}

export const sendEmailCode: Router.Spec = { 
    path: '/send-email-code',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            email: Joi.string().email().required(),
        }
    },
    handler: async (ctx) => {
        const { email } = ctx.request.body
        const code = await emailCodeModel.findCodeInOneMinute(email)
        if (code) {
            logger.warn(`用户 ${email} 1 分钟内发送了验证码`)
            throw new ApiError('请勿频繁发送验证码', HTTP_STATUS.TOO_MANY_REQUESTS)
        }
        const codeStr = generateVerifyCode()
        logger.info(`Email code sending to ${email}: ${codeStr}`)
        try {
            await emailService.sendMail({
                to: email,
                subject: 'imock.io 登录验证码',
                text: `您的验证码是：${codeStr}，请在 5 分钟内使用。`,
            })
        } catch (error) {
            logger.error(`Email code sending to ${email} failed: ${error}`)
            throw new ApiError('验证码发送失败', HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
        await emailCodeModel.createCode(email, codeStr)
        ctx.body = {
            message: '验证码发送成功'
        }
    }
}

export const sendRegisterEmailCode: Router.Spec = {
    path: '/send-register-email-code',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            email: Joi.string().email().required(),
        }
    },
    handler: async (ctx) => {
        const { email } = ctx.request.body
        
        // 检查邮箱是否已被注册
        const existingUser = await userModel.findUserByEmail(email)
        if (existingUser) {
            throw new ApiError('邮箱已被注册', HTTP_STATUS.CONFLICT)
        }
        
        // 检查是否在1分钟内发送过验证码
        const code = await emailCodeModel.findCodeInOneMinute(email)
        if (code) {
            logger.warn(`用户 ${email} 1 分钟内发送了验证码`)
            throw new ApiError('请勿频繁发送验证码', HTTP_STATUS.TOO_MANY_REQUESTS)
        }
        
        // 根据环境生成验证码
        const codeStr = isDev() ? '123456' : generateVerifyCode()
        logger.info(`Register email code for ${email}: ${codeStr} (dev: ${isDev()})`)
        
        // 在开发环境跳过邮件发送，生产环境发送邮件
        if (!isDev()) {
            try {
                await emailService.sendMail({
                    to: email,
                    subject: 'imock.io 注册验证码',
                    text: `您的注册验证码是：${codeStr}，请在 5 分钟内使用。`,
                })
            } catch (error) {
                logger.error(`Register email code sending to ${email} failed: ${error}`)
                throw new ApiError('验证码发送失败', HTTP_STATUS.INTERNAL_SERVER_ERROR)
            }
        }
        
        // 保存验证码到数据库
        await emailCodeModel.createCode(email, codeStr)
        
        ctx.body = {
            message: isDev() ? '验证码发送成功（开发环境）' : '验证码发送成功'
        }
    }
}

export const verifyRegisterEmailCode: Router.Spec = {
    path: '/verify-register-email-code',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            email: Joi.string().email().required(),
            code: Joi.string().length(6).required(),
        }
    },
    handler: async (ctx) => {
        const { email, code } = ctx.request.body
        
        // 检查邮箱是否已被注册
        const existingUser = await userModel.findUserByEmail(email)
        if (existingUser) {
            throw new ApiError('邮箱已被注册', HTTP_STATUS.CONFLICT)
        }
        
        // 验证验证码
        const isValid = await emailCodeModel.isCodeValidInFiveMins(email, code)
        if (!isValid) {
            throw new ApiError('验证码错误或已过期', HTTP_STATUS.UNAUTHORIZED)
        }
        
        // 验证成功，但不删除验证码（留给注册接口删除）
        ctx.body = {
            message: '验证码验证成功',
            valid: true
        }
    }
}

export const register: Router.Spec = {
    path: '/register',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            email: Joi.string().email().required(),
            code: Joi.string().length(6).required(),
            password: Joi.string().min(6).required(),
        }
    },
    handler: async (ctx) => {
        const { email, code, password } = ctx.request.body
        
        // 检查邮箱是否已被注册
        const existingUser = await userModel.findUserByEmail(email)
        if (existingUser) {
            throw new ApiError('邮箱已被注册', HTTP_STATUS.CONFLICT)
        }
        
        // 验证验证码
        const isValid = await emailCodeModel.isCodeValidInFiveMins(email, code)
        if (!isValid) {
            throw new ApiError('验证码错误或已过期', HTTP_STATUS.UNAUTHORIZED)
        }
        
        // 哈希密码
        const hashedPassword = hashPassword(password)
        
        // 创建新用户
        const user = await userModel.createOrUpdateUserByEmail(email, hashedPassword)
        
        // 设置默认 mock API
        await setDefaultMockApi(user.userId)
        
        // 删除验证码
        await emailCodeModel.deleteCode(email, code)
        
        logger.info(`New user registered: ${email} (userId: ${user.userId})`)
        
        // 自动登录
        await loginSuccess(ctx, user)
    }
}


async function loginSuccess(ctx, user) {
    // 如果没有 device_id，则生成一个
    let deviceId = ctx.cookies.get('device_id')
    if (!deviceId) {
        deviceId = generateDeviceId(ctx.request.header['user-agent'] || '')
        ctx.cookies.set('device_id', deviceId, {
            maxAge: 1000 * 60 * 60 * 24 * 365
        })
    }

    // 生成 token，存入 cookie，并保存到数据库
    const token = jwt.sign({}, process.env.JWT_SECRET || '', {
        expiresIn: '30d'
    })
    await authTokenModel.createToken({
        userId: user.userId,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        source: 'PC',
        deviceId,
    })
    ctx.cookies.set('token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    })

    ctx.body = {
        message: 'success',
        data: null,
    }
}

export const verifyEmailCode: Router.Spec = {
    path: '/verify-email-code',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            email: Joi.string().email().required(),
            code: Joi.string().length(6).required(),
        }
    },
    handler: async (ctx) => {
        const { email, code } = ctx.request.body
        const isValid = await emailCodeModel.isCodeValidInFiveMins(email, code)
        if (!isValid) {
            ctx.status = HTTP_STATUS.UNAUTHORIZED
            ctx.body = {
                message: 'invalid code',
                data: null,
            }
            return
        }
        // 验证通过后，如果用户不存在，则创建用户

        let user = await userModel.findUserByEmail(email)
        if (!user) {
            user = await userModel.createOrUpdateUserByEmail(email)

            // 创建默认的 mock api
            await setDefaultMockApi(user.userId)

            // 用户注册成功
        }

        // 删除验证码
        await emailCodeModel.deleteCode(email, code)

        await loginSuccess(ctx, user)
    }
}

export const phoneLogin: Router.Spec = {
    path: '/login/pwd',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            identifier: Joi.string().email().required().messages({
                'string.base': '请输入正确的邮箱',
                'string.email': '请输入正确的邮箱',
            }),
            password: Joi.string().required().messages({
                'string.base': '请输入正确的密码',
            }),
        }
    },
    handler: async (ctx) => {
        const { identifier, password } = ctx.request.body
        const user = await userModel.findUserByEmail(identifier)
        if(!user) {
            throw new ApiError('用户不存在, 请先注册', HTTP_STATUS.UNAUTHORIZED)
        }
        if(!user.password || !password || user.password !== hashPassword(password)) {
            throw new ApiError('邮箱或密码错误', HTTP_STATUS.UNAUTHORIZED)
        }
        await loginSuccess(ctx, user)
    }
}

export const emailLogin: Router.Spec = {
    path: '/login/email',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        }
    },
    handler: async (ctx) => {
        const { email, password } = ctx.request.body
        const user = await userModel.findUserByEmail(email)
        if(!user) {
            ctx.status = HTTP_STATUS.NOT_FOUND
            ctx.body = {
                message: '用户不存在, 请先注册',
                data: null,
            }
            return
        }
        if(!user.password || !password || user.password !== hashPassword(password)) {
            ctx.status = HTTP_STATUS.UNAUTHORIZED
            ctx.body = {
                message: '邮箱或密码错误',
                data: null,
            }
            return
        }
        await loginSuccess(ctx, user)
    }
}


export const setPassword: Router.Spec = {
    path: '/set-password',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            oldPassword: Joi.string(),
            password: Joi.string().min(6).required(),
        },
    },
    handler: [
        checkLogin,
        async (ctx) => {
            const user = ctx.state.user
            const { password, oldPassword } = ctx.request.body

            // 验证旧密码
            if (user.password) {
                if (!oldPassword || user.password !== hashPassword(oldPassword)) {
                    throw new ApiError('旧密码错误', HTTP_STATUS.UNAUTHORIZED)
                }
            }

            // 哈希新密码
            const hashedPassword = hashPassword(password)

            // 更新用户密码
            await userModel.updateUserPassword(user.userId, hashedPassword)

            ctx.body = {
                message: '密码设置成功',
            }
        },]
}


export const setEmail: Router.Spec = {
    path: '/set-email',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            email: Joi.string().email().required(),
            code: Joi.string().length(6).required(),
        }
    },
    handler: [
        checkLogin,
        async (ctx) => {
            const user = ctx.state.user
            const { email, code } = ctx.request.body

            if (user.email === email) {
                throw new ApiError('新邮箱与旧邮箱相同', HTTP_STATUS.BAD_REQUEST)
            }

            const isValid = await emailCodeModel.isCodeValidInFiveMins(email, code)
            if (!isValid) {
                throw new ApiError('验证码错误', HTTP_STATUS.UNAUTHORIZED)
            }

            const newUser = await userModel.findUserByEmail(email)
            if (newUser) {
                throw new ApiError('邮箱已被注册', HTTP_STATUS.CONFLICT)
            }

            await userModel.updateUserEmail(user.userId, email)

            ctx.body = {
                message: '邮箱设置成功',
            }

        }
    ]
}

export const verifyIdentifier: Router.Spec = {
    path: '/verify-identifier',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            identifier: Joi.string().email().required().messages({
                'string.base': '请输入正确的邮箱',
                'string.email': '请输入正确的邮箱',
            })
        }
    },
    handler: async (ctx) => {
        const { identifier } = ctx.request.body
        const user = await userModel.findUserByEmail(identifier)

        ctx.body = {
            valid: !!user,
        }
    }
}

export const verifyPasswordResetCode: Router.Spec = {
    path: '/verify-password-reset-code',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            identifier: Joi.string().email().required().messages({
                'string.base': '请输入正确的邮箱',
                'string.email': '请输入正确的邮箱',
            }),
            code: Joi.string().length(6).required(),
        }
    },
    handler: async (ctx) => {
        const { identifier, code } = ctx.request.body
        const user = await userModel.findUserByEmail(identifier)

        if(!user) {
            throw new ApiError('用户不存在, 请先注册', HTTP_STATUS.UNAUTHORIZED)
        }
        
        const isValid = await emailCodeModel.isCodeValidInFiveMins(identifier, code)

        ctx.body = {
            valid: isValid,
        }
    }
}

export const resetPassword: Router.Spec = {
    path: '/reset-password',
    method: 'post',
    validate: {
        type: 'json',
        body: {
            identifier: Joi.string().email().required().messages({
                'string.base': '请输入正确的邮箱',
                'string.email': '请输入正确的邮箱',
            }),
            password: Joi.string().required().messages({
                'string.base': '请输入正确的密码',
            }),
        }
    },
    handler: async (ctx) => {
        const { identifier, password } = ctx.request.body
        const user = await userModel.findUserByEmail(identifier)
        if(!user) {
            throw new ApiError('用户不存在, 请先注册', HTTP_STATUS.UNAUTHORIZED)
        }

        // 哈希新密码
        const hashedPassword = hashPassword(password)

        // 更新用户密码
        await userModel.updateUserPassword(user.userId, hashedPassword)

        await loginSuccess(ctx, user)
    }
}

export const logout: Router.Spec = {
    path: '/logout',
    method: 'get',
    handler: async (ctx) => {
        const token = ctx.cookies.get('token')
        if (token) {
            // 删除数据库中的 token
            await authTokenModel.deleteToken(token)
            // 删除 cookie 中的 token
            ctx.cookies.set('token', '', { maxAge: 0 })
        }

        ctx.redirect('/')
    },
}

const authRouter = Router()

authRouter.route(verifyEmailCode)
authRouter.route(sendEmailCode)
authRouter.route(sendRegisterEmailCode)
authRouter.route(verifyRegisterEmailCode)
authRouter.route(register)

authRouter.route(emailLogin)
authRouter.route(phoneLogin)
authRouter.route(setPassword)
authRouter.route(setEmail)
authRouter.route(verifyIdentifier)
authRouter.route(verifyPasswordResetCode)
authRouter.route(resetPassword)
authRouter.route(logout)

export default authRouter

