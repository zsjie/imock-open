import httpStatus from 'http-status'
import { Context, Next } from 'koa'

import { findUserByToken } from '~/models/auth-token'

const checkLogin = async (ctx: Context, next: Next) => {
    const token = ctx.cookies.get('token')
    if (!token) {
        ctx.status = httpStatus.UNAUTHORIZED,
        ctx.body = {
            code: httpStatus.UNAUTHORIZED,
            message: 'unlogin',
            data: null,
        }
        return
    }
    const user = await findUserByToken(token)
    if (!user) {
        ctx.status = httpStatus.UNAUTHORIZED
        ctx.body = {
            code: httpStatus.UNAUTHORIZED,
            message: 'invalid token',
            data: null,
        }
        return
    }

    ctx.state.user = user
    return next()
}

export default checkLogin
