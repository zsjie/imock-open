import { ProForm, ProFormCaptcha, ProFormText } from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import { Button, message, Typography } from 'antd'
import { useEffect, useRef,useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PasswordConfirm from '~/components/PasswordConfirm'
import { resetPassword, sendEmailCode, verifyIdentifier, verifyPasswordResetCode } from '~/services/user'
import logger from '~/lib/logger'

enum ResetStep {
    VerifyIdentifier = 1,
    VerifyCode = 2,
    ResetPassword = 3,
}

const { Title, Paragraph } = Typography

const PasswordReset: React.FC = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState<ResetStep>(ResetStep.VerifyIdentifier)
    const [messageApi, contextHolder] = message.useMessage()
    const [identifier, setIdentifier] = useState<string>('')
    const captchaRef = useRef<any>(null)

    const { runAsync: verifyIdentifierAsync, loading: verifyIdentifierLoading } = useRequest(verifyIdentifier, {
        manual: true,
    })

    const sendVerifyCode = async (identifier: string) => {
        await sendEmailCode(identifier)
    }

    const { runAsync: sendVerifyCodeAsync, loading: sendVerifyCodeLoading } = useRequest(sendVerifyCode, {
        manual: true,
    })

    const { runAsync: verifyPasswordResetCodeAsync, loading: verifyPasswordResetCodeLoading } = useRequest(verifyPasswordResetCode, {
        manual: true,
    })

    const { runAsync: resetPasswordAsync, loading: resetPasswordLoading } = useRequest(resetPassword, {
        manual: true,
    })

    const handleVerifyIdentifier = async (values: any) => {
        const { identifier: id } = values
        setIdentifier(id)
        
        try {
            const res = await verifyIdentifierAsync(id)
            if (res?.valid) {
                await sendVerifyCodeAsync(id)
                setStep(ResetStep.VerifyCode)
            } else {
                messageApi.error('该邮箱未注册')
            }
        } catch (error) {
            logger.error(error)
        }
    }

    useEffect(() => {
        if (step === ResetStep.VerifyCode) {
            captchaRef.current?.startTiming?.()
        }
    }, [step])

    const getStepText = (step: ResetStep) => {
        switch (step) {
        case ResetStep.VerifyIdentifier: return '验证码将会发送至你的注册邮箱'
        case ResetStep.VerifyCode: return '验证码已发送至你的注册邮箱'
        case ResetStep.ResetPassword: return '密码必须包含字母、数字，且长度不少于 8 位'
        }
    }

    const handleVerifyCode = async (values: { captcha: string }) => {
        console.log('验证码:', values.captcha)
        try {
            const res = await verifyPasswordResetCodeAsync(identifier, values.captcha)
            if (res?.valid) {
                setStep(ResetStep.ResetPassword)
            } else {
                messageApi.error('验证码错误')
            }
        } catch (error) {
            logger.error(error)
        }
    }

    const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
        if (values.newPassword !== values.confirmPassword) {
            messageApi.error('两次输入的密码不一致')
            return
        }

        try {
            await resetPasswordAsync(identifier, values.newPassword)
            navigate('/home')
        } catch (error: any) {
            messageApi.error(error.message ||'重置密码失败')
            logger.error(error)
        }
    }

    return (
        <div className="flex items-center justify-center p-6">
            {contextHolder}
            <div className='pt-12'>
                <div className="text-center mb-4">
                    <Title level={3}>找回密码</Title>
                    <Paragraph type="secondary">
                        {getStepText(step)}
                    </Paragraph>
                </div>

                {step === ResetStep.VerifyIdentifier && <ProForm
                    className='w-[320px] pt-12'
                    submitter={{
                        render: (props) => (
                            <Button
                                type="primary"
                                size='large'
                                block
                                className='mt-2'
                                onClick={() => props.form?.submit()}
                                key="submit"
                                loading={verifyIdentifierLoading || sendVerifyCodeLoading}
                            >
                                下一步
                            </Button>
                        ),
                    }}
                    onFinish={handleVerifyIdentifier}
                >
                    <ProFormText
                        name="identifier"
                        placeholder="邮箱"
                        fieldProps={{
                            size: 'large',
                        }}
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
                </ProForm>}

                {step === ResetStep.VerifyCode && (
                    <ProForm
                        className='w-[320px] pt-12'
                        submitter={{
                            render: (props) => (
                                <Button 
                                    type="primary" 
                                    size='large' 
                                    block 
                                    className='mt-2' 
                                    onClick={() => props.form?.submit()}
                                    loading={verifyPasswordResetCodeLoading}
                                >
                                    下一步
                                </Button>
                            ),
                        }}
                        onFinish={handleVerifyCode}
                    >
                        <div className="mb-4 flex items-center justify-between bg-neutral-100 py-3 px-4 rounded-lg">
                            <span className='text-[rgba(0,0,0,0.45)]'>{identifier}</span>
                            <Link 
                                to="#" 
                                className="text-blue-600"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setStep(ResetStep.VerifyIdentifier)
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
                                disabled: sendVerifyCodeLoading,
                            }}
                            captchaProps={{
                                size: 'large',
                            }}
                            rules={[
                                {
                                    required: true,
                                    message: '请输入验证码',
                                },
                            ]}
                            onGetCaptcha={async () => {
                                await sendVerifyCode(identifier)
                                messageApi.success('验证码已发送！')
                            }}
                            countDown={60}
                            captchaTextRender={(timing, count) => {
                                return timing ? `${count} 秒后重新获取` : '重新获取验证码'
                            }}
                        />
                    </ProForm>
                )}

                {step === ResetStep.ResetPassword && <ProForm
                    className='w-[320px] pt-12'
                    onFinish={handleResetPassword}
                    submitter={{
                        render: (props) => (
                            <Button 
                                type="primary" 
                                size='large' 
                                block 
                                className='mt-2' 
                                onClick={() => props.form?.submit()}
                                loading={resetPasswordLoading}
                            >
                                重置密码
                            </Button>
                        ),
                    }}
                >
                    <PasswordConfirm size='large' showLabel={false} />
                </ProForm>}
            </div>
        </div>
    )
}

export default PasswordReset
