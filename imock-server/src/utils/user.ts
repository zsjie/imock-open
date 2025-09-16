import { ADMIN_USER_ID } from '~/lib/constant'

export const isAdminUser = (userId: string) => {
    return userId === ADMIN_USER_ID
}