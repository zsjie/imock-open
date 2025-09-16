import fetch from '~/utils/fetch'


export const sendEmailCode = async (email: string) => {
    return fetch.post('/auth/send-email-code', { email })
}


export const getUserInfo = async () => {
    return fetch.get('/user/user-info')
}

export const loginPwd = async (identifier: string, password: string) => {
    return fetch.post('/auth/login/pwd', { identifier, password })
}

export const setPassword = async (data: {
    oldPassword?: string;
    password: string;
}): Promise<{ message: string }> => {
    return fetch.post('/auth/set-password', data)
}


export const setEmail = async (email: string, code: string) => {
    return fetch.post('/auth/set-email', { email, code })
}

export const verifyIdentifier = async (identifier: string): Promise<{ valid: boolean }> => {
    return fetch.post('/auth/verify-identifier', { identifier })
}

export const verifyPasswordResetCode = async (identifier: string, code: string): Promise<{ valid: boolean }> => {
    return fetch.post('/auth/verify-password-reset-code', { identifier, code })
}

export const resetPassword = async (identifier: string, password: string) => {
    return fetch.post('/auth/reset-password', { identifier, password })
}

export const sendRegisterEmailCode = async (email: string) => {
    return fetch.post('/auth/send-register-email-code', { email })
}

export const verifyRegisterEmailCode = async (email: string, code: string): Promise<{ valid: boolean; message: string }> => {
    return fetch.post('/auth/verify-register-email-code', { email, code })
}

export const register = async (email: string, code: string, password: string) => {
    return fetch.post('/auth/register', { email, code, password })
} 