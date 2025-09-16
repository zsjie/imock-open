export const isDev = () => process.env.RUNTIME_ENV === 'development'

export const isTest = () => process.env.RUNTIME_ENV === 'test'

export const isProd = () => process.env.RUNTIME_ENV === 'production'

export const getOrigin = () => process.env.ORIGIN

export const getStaticEndpoint = () => `${getOrigin()}/static-files`

export const getStaticDir = () => process.env.STATIC_DIR || '/app/static-dev'
