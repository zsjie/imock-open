const disableEtag = () => async (ctx, next) => {
    ctx.set('etag', '')
    return next()
}

export default disableEtag
