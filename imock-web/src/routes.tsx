import { lazy, Suspense } from 'react'
import { Navigate, Outlet, ScrollRestoration } from 'react-router-dom'

import Auth from '~/components/Auth'

import Layout from './components/Layout'
import PageLoading from './components/PageLoading'
import SettingContainer from './pages/Settings/SettingContainer'

const Index = lazy(() => import('~/pages/Index'))
const Home = lazy(() => import('~/pages/Home'))
const Login = lazy(() => import('~/pages/Login'))
const Register = lazy(() => import('~/pages/Register'))
const AccountPage = lazy(() => import('~/pages/Settings/Account'))
const PasswordReset = lazy(() => import('~/pages/PasswordReset'))
const Share = lazy(() => import('~/pages/Share'))

export const router = [
    {
        path: '/',
        element: (
            <>
                <Outlet />
                <ScrollRestoration />
            </>
        ),
        children: [
            {
                index: true,
                element: <Suspense fallback={<PageLoading />}>
                    <Auth redirectToLogin={false}>
                        <Index />
                    </Auth>
                </Suspense>,
            },
            {
                path: '/home',
                element: (
                    <Suspense fallback={<PageLoading />}>
                        <Auth redirectToLogin={false}><Home /></Auth>
                    </Suspense>
                ),
            },
            {
                path: '/settings',
                element: (
                    <Auth>
                        <SettingContainer />
                    </Auth>
                ),
                children: [
                    {
                        index: true,
                        element: <Navigate to="/settings/account" replace />,
                    },
                    {
                        index: true,
                        path: 'account',
                        element: (
                            <Suspense fallback={<PageLoading />}>
                                <AccountPage />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: '/password-reset',
                element: <Layout><Outlet /></Layout>,
                children: [
                    {
                        index: true,
                        element: (
                            <Suspense fallback={<PageLoading />}>
                                <PasswordReset />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: '/login',
                element: (
                    <Suspense fallback={<PageLoading />}>
                        <Auth redirectToLogin={false}><Login /></Auth>
                    </Suspense>
                ),
            },
            {
                path: '/register',
                element: (
                    <Suspense fallback={<PageLoading />}>
                        <Auth redirectToLogin={false}><Register /></Auth>
                    </Suspense>
                ),
            },
            {
                path: '/share/:shareId',
                element: (
                    <Suspense fallback={<PageLoading />}>
                        <Auth redirectToLogin={false}><Share /></Auth>
                    </Suspense>
                ),
            },
        ],
    },
]
