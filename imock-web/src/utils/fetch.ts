import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import axios, { AxiosError } from 'axios'
import { omit } from 'lodash'

import { noLoginPages } from '~/constants/noLoginPages'
import logger from '~/lib/logger'

type ApiFunction = (
  url: string,
  data?: any,
  options?: Omit<AxiosRequestConfig, 'data' | 'url' | 'method'> & {
    handleErr?: (params: unknown) => void;
    formDataMethod?: 'application/x-www-form-urlencoded' | 'multipart/form-data';
  },
) => Promise<any | void>;

const handleResponse = (response: AxiosResponse<Record<string, unknown>>): Promise<any | void> => {
    if (response.data.code !== 0) {
        return Promise.reject(response.data)
    }

    return Promise.resolve(response.data.data)
}

const instance = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
})

const methods: Method[] = ['get', 'post', 'put', 'delete']

export default methods.reduce(
    (apiObject, key) => {
        const apiFun: ApiFunction = (
            url,
            data = {},
            options = {},
        ): Promise<any | void> | any | void => {
            if (options.formDataMethod) {
                options.headers = { ...options.headers, 'content-type': options.formDataMethod }

                if (options.formDataMethod === 'application/x-www-form-urlencoded') {
                    data = new URLSearchParams(data as Record<string, string>)
                }
            }

            if (['get'].includes(key)) {
                data = { params: data }
            } else {
                data = { data }
            }

            return instance
                .request({
                    url,
                    method: key,
                    baseURL: '/server/api',
                    ...data,
                    ...omit(options, ['handleErr', 'headers']),
                    headers: {
                        ...options.headers,
                    },
                })
                .then(response => {
                    if (Object.prototype.toString.call(response.data).slice(8, -1) === 'Blob') {
                        if (response.data.type === 'application/json') {
                            return (response.data as Blob)
                                .text()
                                .then(text => {
                                    const data = JSON.parse(text)

                                    response.data = data

                                    return handleResponse(response)
                                })
                                .catch(error => Promise.reject(error))
                        }

                        return response
                    }

                    return handleResponse(response)
                })
                .catch((err: any) => {
                    logger.error('fetch error', err)

                    let message: string = err?.msg

                    if (err instanceof AxiosError) {
                        if ([401, 502].includes(err.response?.status as number)) {
                            if (!noLoginPages.includes(window.location.pathname)) {
                                const currentPath = window.location.pathname + window.location.search
                                logger.info(`redirect to login, currentPath: ${currentPath}`)
                                window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`
                                return
                            }
                        }

                        message = err.response?.data?.msg
                    }

                    if (typeof options?.handleErr === 'function') {
                        options.handleErr(err)
                        return
                    }

                    message = message ?? '请求失败，请联系管理员处理'

                    throw new Error(message)
                })
        }
        apiObject[key] = apiFun

        return apiObject
    },
  {} as Record<Method, ApiFunction>,
)
