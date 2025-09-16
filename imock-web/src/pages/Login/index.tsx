import { LOGO_URL_LARGE } from '@/lib/constants'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import {
    LoginForm,
    ProConfigProvider,
    ProFormText,
} from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import { message, theme } from 'antd'
import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import { loginPwd } from '~/services/user'
import { useUserStore } from '~/store'

type LoginType = 'account';


const Login = () => {
    const [messageApi, contextHolder] = message.useMessage()
    const { token } = theme.useToken()
    const [loginType, setLoginType] = useState<LoginType>('account')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const { userInfo } = useUserStore()
    const [searchParams] = useSearchParams()


    const { runAsync: loginByIdentifier, loading: loginPwdLoading } = useRequest(loginPwd, {
        manual: true,
    })

    const onFinish = async (values: any) => {
        try {
            await loginByIdentifier(values.identifier, values.password)
            const returnUrl = searchParams.get('returnUrl') || '/home'
            window.location.href = returnUrl
        } catch (error: any) {
            messageApi.error(error.message || '登录失败，请重试！')
        }
    }

    useEffect(() => {
        if (!userInfo) {
            return
        }

        setIsAuthenticated(!!userInfo?.userId)
    }, [userInfo])

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return (
        <ProConfigProvider hashed={false}>
            {contextHolder}
            <div style={{ backgroundColor: token.colorBgContainer }}>
                <LoginForm
                    logo=""
                    title=""
                    subTitle={<div>
                        <div  style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '12px',
                        }}>
                            <img src={LOGO_URL_LARGE} width="235" alt="logo" />
                        </div>
                        <div>下一代 mock 工具</div>
                    </div>}
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: {
                            submitText: '登录',
                        },
                        submitButtonProps: {
                            disabled: loginPwdLoading,
                        }
                    }}
                >
                    <ProFormText
                        name="identifier"
                        fieldProps={{
                            size: 'large',
                            prefix: <UserOutlined className={'prefixIcon'} />,
                        }}
                        placeholder={'邮箱'}
                        rules={[
                            {
                                required: true,
                                message: '请输入邮箱',
                            },
                            {
                                pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
                                message: '请输入有效的邮箱',
                            },
                        ]}
                    />
                    <ProFormText.Password
                        name="password"
                        fieldProps={{
                            size: 'large',
                            prefix: <LockOutlined className={'prefixIcon'} />,
                        }}
                        placeholder={'密码'}
                        rules={[
                            {
                                required: true,
                                message: '请输入密码！',
                            },
                        ]}
                    />
                    <div className="flex justify-between pb-4">
                        <Link className='text-sm text-blue-500 hover:text-blue-600' to="/register">立即注册</Link>
                        <Link className='text-sm text-neutral-400' to="/password-reset" target='_blank'>忘记密码？</Link>
                    </div>
                </LoginForm>
            </div>
        </ProConfigProvider>
    )
}

export default Login
