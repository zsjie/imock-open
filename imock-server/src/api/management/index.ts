import Router from 'koa-joi-router'

import checkLogin from '~/middlewares/check-login'

import userMockApis from './user-mocks'

const managementApi = Router()

managementApi.use(checkLogin)
managementApi.use('/user-mocks', userMockApis.middleware())

export default managementApi
