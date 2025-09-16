import cors from '@koa/cors'
import Koa from 'koa'
import accesslog from 'koa-accesslog'
import serve from 'koa-static'

import route from '~/lib/route'
import proxyApi from '~/middlewares/proxy-api'

import { getStaticDir } from './utils/env'

export default function(): Koa {
    const app = new Koa()

    app.proxy = true

    app.use(accesslog())
    app.use(serve(getStaticDir()))
    app.use(cors())

    app.use(proxyApi())

    app.use(route().middleware())

    return app
}
