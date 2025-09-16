import { LOGO_URL_LARGE } from '@/lib/constants'
import { UserOutlined } from '@ant-design/icons'
import {
    LoginForm,
    ProConfigProvider,
    ProFormCaptcha,
    ProFormText,
} from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import { message, theme } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import PasswordConfirm from '~/components/PasswordConfirm'
import { register, sendRegisterEmailCode, verifyRegisterEmailCode } from '~/services/user'
import { useUserStore } from '~/store'

enum RegisterStep {
    VerifyEmail = 1,
    VerifyCode = 2,
    SetPassword = 3,
    Success = 4,
}

const Register = () => {
    const [messageApi, contextHolder] = message.useMessage()
    const { token } = theme.useToken()
    const [step, setStep] = useState<RegisterStep>(RegisterStep.VerifyEmail)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const { userInfo } = useUserStore()
    const [email, setEmail] = useState<string>('')
    const [verificationCode, setVerificationCode] = useState<string>('')
    const captchaRef = useRef<any>(null)

    const { runAsync: sendEmailCode, loading: sendEmailCodeLoading } = useRequest(sendRegisterEmailCode, {
        manual: true,
    })

    const { runAsync: verifyEmailCode, loading: verifyEmailCodeLoading } = useRequest(verifyRegisterEmailCode, {
        manual: true,
    })

    const { runAsync: registerUser, loading: registerLoading } = useRequest(register, {
        manual: true,
    })

    useEffect(() => {
        if (!userInfo) {
            return
        }
        setIsAuthenticated(!!userInfo?.userId)
    }, [userInfo])

    useEffect(() => {
        if (step === RegisterStep.VerifyCode) {
            captchaRef.current?.startTiming?.()
        }
    }, [step])

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    const getStepTitle = () => {
        switch (step) {
            case RegisterStep.VerifyEmail:
                return '创建账号'
            case RegisterStep.VerifyCode:
                return '验证邮箱'
            case RegisterStep.SetPassword:
                return '设置密码'
            case RegisterStep.Success:
                return '注册成功'
            default:
                return '注册'
        }
    }

    const getStepSubtitle = () => {
        switch (step) {
            case RegisterStep.VerifyEmail:
                return '请输入您的邮箱地址'
            case RegisterStep.VerifyCode:
                return '验证码已发送至您的邮箱'
            case RegisterStep.SetPassword:
                return '请设置您的登录密码'
            case RegisterStep.Success:
                return '注册成功，即将跳转...'
            default:
                return '欢迎使用 imock'
        }
    }

    const onFinish = async (values: any) => {
        if (step === RegisterStep.VerifyEmail) {
            // 步骤1：发送验证码
            try {
                await sendEmailCode(values.email)
                setEmail(values.email)
                setStep(RegisterStep.VerifyCode)
                messageApi.success('验证码发送成功！')
            } catch (error: any) {
                messageApi.error(error.message || '验证码发送失败，请重试！')
            }
        } else if (step === RegisterStep.VerifyCode) {
            // 步骤2：验证验证码
            try {
                await verifyEmailCode(email, values.captcha)
                setVerificationCode(values.captcha)
                setStep(RegisterStep.SetPassword)
                messageApi.success('验证码验证成功！')
            } catch (error: any) {
                messageApi.error(error.message || '验证码错误，请重试！')
            }
        } else if (step === RegisterStep.SetPassword) {
            // 步骤3：设置密码并完成注册
            try {
                await registerUser(email, verificationCode, values.newPassword)
                setStep(RegisterStep.Success)
                messageApi.success('注册成功！即将跳转...')
                // 3秒后跳转到首页
                setTimeout(() => {
                    window.location.href = '/home'
                }, 3000)
            } catch (error: any) {
                messageApi.error(error.message || '注册失败，请重试！')
            }
        } else {
            // 其他步骤暂时显示开发中
            messageApi.info('功能开发中，敬请期待！')
        }
    }

    return (
        <ProConfigProvider hashed={false}>
            {contextHolder}
            <div style={{ backgroundColor: token.colorBgContainer }}>
                <LoginForm
                    logo=""
                    title=""
                    subTitle={
                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '12px',
                                }}
                            >
                                <img
                                    src={LOGO_URL_LARGE}
                                    width="235"
                                    alt="logo"
                                />
                            </div>
                            <div className="text-lg font-medium mb-2">{getStepTitle()}</div>
                            <div className="text-sm text-gray-500">{getStepSubtitle()}</div>
                        </div>
                    }
                    onFinish={onFinish}
                    submitter={step === RegisterStep.Success ? false : {
                        searchConfig: {
                            submitText: step === RegisterStep.VerifyEmail ? '发送验证码' : 
                                      step === RegisterStep.SetPassword ? '完成注册' : '下一步',
                        },
                        submitButtonProps: {
                            loading: step === RegisterStep.VerifyEmail ? sendEmailCodeLoading : 
                                   step === RegisterStep.VerifyCode ? verifyEmailCodeLoading :
                                   step === RegisterStep.SetPassword ? registerLoading : false,
                            disabled: step === RegisterStep.VerifyEmail ? sendEmailCodeLoading : 
                                    step === RegisterStep.VerifyCode ? verifyEmailCodeLoading :
                                    step === RegisterStep.SetPassword ? registerLoading : false,
                        }
                    }}
                >
                    {/* 步骤1: 邮箱输入 */}
                    {step === RegisterStep.VerifyEmail && (
                        <ProFormText
                            name="email"
                            fieldProps={{
                                size: 'large',
                                prefix: <UserOutlined className={'prefixIcon'} />,
                            }}
                            placeholder={'请输入邮箱地址'}
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
                    )}

                    {/* 步骤2: 验证码输入 */}
                    {step === RegisterStep.VerifyCode && (
                        <div>
                            <div className="mb-4 flex items-center justify-between bg-neutral-100 py-3 px-4 rounded-lg">
                                <span className='text-[rgba(0,0,0,0.45)]'>{email}</span>
                                <Link 
                                    to="#" 
                                    className="text-blue-600"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setStep(RegisterStep.VerifyEmail)
                                    }}
                                >
                                    修改
                                </Link>
                            </div>

                            <ProFormCaptcha
                                name="captcha"
                                placeholder="请输入验证码"
                                fieldRef={captchaRef}
                                fieldProps={{
                                    size: 'large',
                                    disabled: sendEmailCodeLoading,
                                }}
                                captchaProps={{
                                    size: 'large',
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入验证码',
                                    },
                                    {
                                        len: 6,
                                        message: '验证码必须是6位数字',
                                    },
                                ]}
                                onGetCaptcha={async () => {
                                    await sendEmailCode(email)
                                    messageApi.success('验证码已重新发送！')
                                }}
                                countDown={60}
                                captchaTextRender={(timing, count) => {
                                    return timing ? `${count} 秒后重新获取` : '重新获取验证码'
                                }}
                            />

                            <div className="text-center mt-4">
                                <div className="text-sm text-blue-500">
                                    开发环境验证码：123456
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 步骤3: 密码设置 */}
                    {step === RegisterStep.SetPassword && (
                        <div>
                            <div className="mb-4 flex items-center justify-between bg-neutral-100 py-3 px-4 rounded-lg">
                                <span className='text-[rgba(0,0,0,0.45)]'>{email}</span>
                                <Link 
                                    to="#" 
                                    className="text-blue-600"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setStep(RegisterStep.VerifyEmail)
                                    }}
                                >
                                    修改
                                </Link>
                            </div>

                            <PasswordConfirm size="large" showLabel={false} />
                        </div>
                    )}

                    {/* 步骤4: 注册成功 */}
                    {step === RegisterStep.Success && (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <div className="text-6xl text-green-500 mb-4">✓</div>
                                <div className="text-xl font-medium text-gray-800 mb-2">注册成功！</div>
                                <div className="text-sm text-gray-500">
                                    欢迎使用 imock.io，即将为您跳转到首页...
                                </div>
                            </div>
                        </div>
                    )}

                    {step !== RegisterStep.Success && (
                        <div className="flex justify-between pb-4 pt-2">
                            <Link className='text-sm text-blue-500 hover:text-blue-600' to="/login">
                                已有账号？立即登录
                            </Link>
                            {step === RegisterStep.VerifyEmail && (
                                <Link className='text-sm text-neutral-400' to="/password-reset" target='_blank'>
                                    忘记密码？
                                </Link>
                            )}
                        </div>
                    )}
                </LoginForm>
            </div>
        </ProConfigProvider>
    )
}

export default Register
