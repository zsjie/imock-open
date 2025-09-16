import Router from 'koa-joi-router'
import { pick } from 'lodash'

import checkLogin from '~/middlewares/check-login'

export const getUserInfo: Router.Spec = {
    path: '/user-info',
    method: 'get',
    handler: async (ctx) => {
        const user = pick(ctx.state.user, ['userId', 'nickname', 'avatar', 'cancelled', 'verified', 'password', 'email'])
        const isSetPassword = !!user.password
        delete user.password

        ctx.body = {
            ...user,
            isSetPassword
        }
    }
}


const userApis = Router()

userApis.use(checkLogin)

userApis.route(getUserInfo)

export default userApis
