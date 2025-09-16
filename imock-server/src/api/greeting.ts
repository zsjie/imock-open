import { Context } from 'koa'
import Router, { Joi } from 'koa-joi-router'

export const greet: Router.Config | Router.Spec = {
    validate: {
        query: {
            name: Joi.string().description('用户名称'),
        }
    },
    handler: async (ctx: Context) => {
        const { name } = ctx.request.query
        ctx.body = `hello, ${name || 'world'}!`
    }
}
