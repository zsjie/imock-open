import React, { useCallback, useEffect } from 'react'

import logger from '~/lib/logger'
import { getUserInfo } from '~/services/user'
import { useUserStore } from '~/store'

interface WithUserInfoProps {
  children: JSX.Element;
}

const WithUserInfo: React.FC<WithUserInfoProps> = ({ children }) => {
    const { setUserInfo } = useUserStore()

    const fetchUserInfo = useCallback(async () => {
        try {
            const userInfo = await getUserInfo()
            setUserInfo(userInfo)
        } catch (error) {
            logger.error('获取用户信息失败', error)
        }
    }, [setUserInfo])

    useEffect(() => {
        fetchUserInfo()
    }, [fetchUserInfo])

    return children
}

export default WithUserInfo
