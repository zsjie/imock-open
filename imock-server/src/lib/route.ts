import Router from 'koa-joi-router'

import api from '../api'

export default function () {
    const router = Router()

    router.get('/ping', async ctx => ctx.body = 'pong')
    router.use('/api', api.middleware())

    return router
}
