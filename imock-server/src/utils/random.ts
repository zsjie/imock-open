import crypto from 'crypto'

export function randomStr(n: number, candidate?: string): string {
    candidate = candidate || 'abcdefghijklmnopqrstuvwxyz0123456789'
    const candidateLength = candidate.length
    n = n || 8
    let result = ''
    for (let i = 0; i < n; i++) {
        result += candidate[Math.floor(Math.random() * candidateLength)]
    }
    return result
}

export function randomNumStr(n: number) {
    return randomStr(n, '0123456789')
}

export function randomNum(n: number): number {
    const min = Math.pow(10, n - 1)
    const max = Math.pow(10, n)
    return Math.floor(Math.random() * (max - min) + min)
}

export function generateDeviceId(ua: string) {
    const hash = crypto.createHash('sha256')
    hash.update(`${ua}-${Date.now()}-${Math.random()}`)
    return hash.digest('hex')
}

export function generateVerifyCode(): string {
    // 首位不能为0，所以从1-9中随机选择
    const firstDigit = Math.floor(Math.random() * 9) + 1
    // 剩余5位可以是0-9
    const remainingDigits = randomNumStr(5)
    return `${firstDigit}${remainingDigits}`
}
