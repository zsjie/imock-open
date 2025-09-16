export function getUrl(originalUrl: string) {
    const url = originalUrl.split('?')[0]
    return url.endsWith('/') ? url.slice(0, -1) : url
}

export function isIP(str: string) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(str)
}

export enum UrlCheckError {
    IP_NOT_ALLOWED = 'IP_NOT_ALLOWED',
    INVALID_URL = 'INVALID_URL',
}

export function checkUrl(str: string) {
    try {
        const url = new URL(str)
        const hostname = url.hostname
        if (isIP(hostname)) {
            return {
                isValid: false,
                message: UrlCheckError.IP_NOT_ALLOWED,
            }
        }
        return {
            isValid: true,
            message: '',
        }

    } catch (_) {
        return {
            isValid: false,
            message: UrlCheckError.INVALID_URL,
        }
    }
    
}

/**
 * 拼接URL
 * @param backendUrl 例如 https://imock.pro/
 * @param path 例如 /api/user
 * @returns https://imock.pro/api/user
 */
export function joinUrl(backendUrl: string, path: string) {
    // 如果 path 是完整的 URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }
    
    // 如果没有 backendUrl，直接返回 path
    if (!backendUrl) {
        return path
    }

    try {
        return new URL(path, backendUrl).href
    } catch (_error) {
        return path
    }
}
