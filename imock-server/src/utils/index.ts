import { IncomingHttpHeaders } from 'http'

import { md5 } from './hash'

export const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const getProxyApiPath = () => '/proxy-api'

export const isProxyApi = (url: string) => {
    return url.startsWith(getProxyApiPath())
}

export const formatProxyUrl = (url: string) => {
    return url.trim().replace(/^\/proxy-api/, '')
}

export const getUrlPath = (url: string) => {
    return formatProxyUrl(url).split('?')[0]
}

export function getUrlHash(url: string) {
    const _url = formatProxyUrl(url).split('?')[0]
    const urlHash = md5(_url)
    return urlHash
}

export const safeParse = (str: string) => {
    try {
        return JSON.parse(str)
    } catch (error) {
        return str
    }
}

export const getMockIdFromHeaders = (headers: IncomingHttpHeaders) => {
    return typeof headers['x-imock-id'] === 'string' ? headers['x-imock-id'] : headers['x-imock-id']?.[0]
}

export const formatTargetUrl = (target: string, url: string) => {
    return `${target.replace(/\/$/, '')}${url.replace(/^\/proxy-api/, '')}`
}

export const removeImockHeaders = <T extends string | object>(headers: T): T => {
    let _headers = headers
    if (typeof _headers === 'string') {
        _headers = safeParse(_headers)
    }

    // 删除 x-imock- 开头的 header
    if (typeof _headers === 'object') {
        Object.keys(_headers).forEach((key) => {
            if (key.startsWith('x-imock-') || key.startsWith('x-mocked-by-imock')) {
                delete _headers[key]
            }
        })

        if (typeof headers === 'object') {
            return _headers as T
        }

        return JSON.stringify(_headers) as T
    }

    return _headers as T
}
