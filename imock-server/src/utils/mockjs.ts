import { isPlainObject } from 'lodash'
import mockjs from 'mockjs'

import avatarUrls from '~/fixtures/avatar-urls.json'
import goodsImageUrls from '~/fixtures/goods-image-urls.json'
import landscapeImageUrls from '~/fixtures/landscape-image-urls.json'

import { safeParse } from '.'

mockjs.Random.extend({
    goodsImage() {
        // 返回一个随机的商品图片

        return this.pick(goodsImageUrls)
    },
    goodsImageList() {
        // 返回一个随机的商品图片列表
        return this.shuffle(goodsImageUrls).slice(0, this.integer(1, 5))
    },
    avatar() {
        // 返回一个随机的头像
        return this.pick(avatarUrls)
    },
    postImage() {
        // 返回一个随机的风景图片
        return this.pick(landscapeImageUrls)
    }
})

export function formatMockResponseBody(body: string | object) {
    const _body = typeof body === 'string' ? safeParse(body) : body
    if (isPlainObject(_body) || Array.isArray(_body)) {
        return mockjs.mock(_body)
    }
    return _body
}