import Router from 'koa-joi-router'

import logger from '~/lib/logger'
import { findAllUsers } from '~/models/user'
import { findMockApiByUrlAndMethod, setDefaultMockApi } from '~/models/user-mocks'
import { getUrlHash } from '~/utils'

export const setMockApi: Router.Spec = {
    path: '/set-default-mock-api',
    method: 'get',
    handler: async (ctx) => {
        const users = await findAllUsers()
        for (const user of users) {
            const mockApi = await findMockApiByUrlAndMethod(user.userId, getUrlHash('/imock/todos'), 'GET')
            if (!mockApi.length) {
                logger.info(`Set default mock api for user ${user.userId}`)
                await setDefaultMockApi(user.userId)
            } else {
                logger.info(`Default mock api already set for user ${user.userId}`, mockApi)
            }
        }
        ctx.body = {
            success: true,
        }
    }
}

const toolApis = Router()

toolApis.route(setMockApi)

export default toolApis

