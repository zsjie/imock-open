import { MockEnv } from '~/lib/constants'
import fetch from '~/utils/fetch'

import {
    DeleteApiMockResp,
    GenerateBySchemaResp,
    GetApiMockListParams,
    GetApiMockListResp,
    ListMockUrlResp,
    SetMockUrlParams,
    SetMockUrlResp,
    ShareData,
    ShareRequestResp,
    UpdateApiMockParams,
    UpdateApiMockResp} from './types'

export const updateApiMock = (data: UpdateApiMockParams): Promise<UpdateApiMockResp> =>
    fetch.post('/management/user-mocks', data)

export const deleteApiMock = (id: number): Promise<DeleteApiMockResp> =>
    fetch.delete(`/management/user-mocks/${id}`)

export const getApiMockList = (params: GetApiMockListParams): Promise<GetApiMockListResp> =>
    fetch.get('/management/user-mocks', params)

export const startApiMock = (id: number): Promise<DeleteApiMockResp> =>
    fetch.post(`/management/user-mocks/start/${id}`)

export const stopApiMock = (id: number): Promise<DeleteApiMockResp> =>
    fetch.post(`/management/user-mocks/stop/${id}`)

export const generateBySchema = (schema: string): Promise<GenerateBySchemaResp> =>
    fetch.post('/management/user-mocks/generate-by-ts', { schema })

export const setMockUrls = (data: SetMockUrlParams): Promise<SetMockUrlResp> =>
    fetch.post('/management/user-mocks/set-mock-url', data)

export const listMockUrls = (): Promise<ListMockUrlResp> =>
    fetch.get('/management/user-mocks/list-mock-url')

export const updateAIMockSwitch = (data: { url: string, method: string, aiMockRunning: boolean }): Promise<SetMockUrlResp> =>
    fetch.post('/management/user-mocks/ai-mock-switch', data)

export const uploadOpenapi = (data: {
    openapi: ObjectAny
}): Promise<any> =>
    fetch.post('/management/user-mocks/import-openapi', data)


export const shareRequest = (shareData: ShareData): Promise<ShareRequestResp> => {
    return fetch.post('/request-share/share-url', shareData)
}

export const getShareData = (shareId: string): Promise<ShareData> => {
    return fetch.get(`/request-share/share-url/${shareId}`)
}

export const switchMockEnv = (enableEnv: MockEnv) => {
    return fetch.post('/management/user-mocks/switch-env', { enableEnv })
}

