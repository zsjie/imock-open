import React, { useCallback, useEffect, useState } from 'react'

import { getUserInfo } from '~/services/user'
import { useUserStore } from '~/store'

interface AuthProps {
  children: JSX.Element;
  redirectToLogin?: boolean;
}

const Auth: React.FC<AuthProps> = ({ children, redirectToLogin = true }) => {
    const [ready, setReady] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const { setUserInfo, clearUserInfo } = useUserStore()


    const fetchUserInfo = useCallback(async () => {
        try {
            const userInfo = await getUserInfo()
            setIsAuthenticated(true)
            setUserInfo(userInfo)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setIsAuthenticated(false)
            clearUserInfo()
        } finally {
            setReady(true)
        }
    }, [setUserInfo, clearUserInfo])

    useEffect(() => {
        fetchUserInfo()
    }, [])

    if (!ready) {
        return null
    }

    if (!isAuthenticated && redirectToLogin) {
        const currentPath = window.location.pathname + window.location.search
        window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`
        return null
    }

    return children
}

export default Auth