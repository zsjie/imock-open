export const IMOCK_API_HOST =
    process.env.IMOCK_API_HOST || window.location.origin

export const MOCK_ENDPOINT = process.env.MOCK_ENDPOINT || ''

export enum MockEnv {
    dev = 'dev',
    test = 'test',
    pre = 'pre',
    prod = 'prod',
    none = 'none'
}

export const DEFAULT_AVATAR_URL = 'https://mock-static.imock.pro/assets/images/avatar/default_avatar_1.jpg'

export const LOGO_ICON = 'https://mock-static.imock.pro/assets/images/imock_logo_516x516.png.webp'

export const LOGO_URL = 'https://mock-static.imock.pro/assets/images/imock_logo_1.png'

export const LOGO_URL_LARGE = 'https://mock-static.imock.pro/assets/images/imock_logo_2.png'
