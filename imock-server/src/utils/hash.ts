import { createHash } from 'crypto'

export function md5(input) {
    return createHash('md5').update(input).digest('hex')
}