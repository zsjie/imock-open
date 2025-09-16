import bodyParser from '@koa/bodyparser'
import compose from 'koa-compose'

import httpProxy from './http-proxy'
import mockRequest from './mock-request'
import mockWithAI from './mock-with-ai'

const proxyApi = () => {
    return compose([
        bodyParser(),
        mockRequest(),
        httpProxy(),
        mockWithAI(),
    ])
}

export default proxyApi


