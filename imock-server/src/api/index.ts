import Router from 'koa-joi-router'

import responseFormatter from '~/middlewares/response-formatter'

import authApi from './auth'
import * as greetingApi from './greeting'
import * as healthCheckApi from './health-check'
import managementApi from './management'
import requestShareApi from './request-share'
import toolApi from './tool'
import userApi from './user'

const router = Router()

router.get('/greeting', greetingApi.greet)
router.get('/health-check', healthCheckApi.healthCheck)

router.use(responseFormatter)

router.use('/management', managementApi.middleware())
router.use('/auth', authApi.middleware())
router.use('/user', userApi.middleware())
router.use('/tool', toolApi.middleware())
router.use('/request-share', requestShareApi.middleware())

export default router
