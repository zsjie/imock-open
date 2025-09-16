import { Context, Next } from 'koa'

const removeCacheHeaders = () => async (ctx: Context, next: Next) => {
    await next()

    // 移除缓存相关的响应头
    ctx.remove('etag')
    ctx.remove('cache-control')
    ctx.remove('last-modified')
    ctx.remove('expires')
    ctx.remove('pragma')
    ctx.remove('if-modified-since')
}

export default removeCacheHeaders