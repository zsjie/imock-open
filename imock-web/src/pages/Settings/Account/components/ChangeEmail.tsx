import { LockOutlined, MailOutlined } from '@ant-design/icons'
import ProForm, { ProFormCaptcha, ProFormText } from '@ant-design/pro-form'
import { useRequest } from 'ahooks'
import { Button, Divider,message } from 'antd'
import React, { useState } from 'react'

import { sendEmailCode, setEmail } from '~/services/user'
import { useUserStore } from '~/store'


const ChangePhoneForm: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage()
    const [updatePhone, setUpdatePhone] = useState(false)

    const { userInfo, refreshUserInfo } = useUserStore()

    const {
        runAsync: setEmailRequest,
    } = useRequest(setEmail, { manual: true })

    const handleSubmit = async (values: { email: string; captcha: string; }) => {
        try {
            await setEmailRequest(
                values.email,
                values.captcha
            )
            setUpdatePhone(false)
            refreshUserInfo()
            messageApi.success('邮箱修改成功')
        } catch (error: any) {
            messageApi.error(error?.message || '邮箱修改失败，请稍后重试')
        }
    }

    return (<div className='pb-6'>
        {contextHolder}
        <h2 className='font-bold text-lg flex justify-between'>
            <div>邮箱</div>
            <div>
                <Button onClick={() => { 
                    setUpdatePhone(!updatePhone)
                }}>{updatePhone ? '收起' : (userInfo?.email ? '修改邮箱' : '设置邮箱')}</Button>
            </div>
        </h2>
        <Divider className='mt-3' />
        <div>
            { updatePhone ? <ProForm
                className='w-64'
                onFinish={handleSubmit}
                submitter={{
                    render: (props) => {
                        return [
                            <Button
                                type="default"
                                onClick={() => props.form?.submit()}
                                key="submit"
                            >
                                提交
                            </Button>,
                        ]
                    }
                }}
            >
                <ProFormText
                    fieldProps={{
                        prefix: <MailOutlined className={'prefixIcon'} />,
                    }}
                    name="email"
                    placeholder={'请输入邮箱'}
                    rules={[
                        {
                            required: true,
                            message: '请输入邮箱！',
                        },
                        {
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: '邮箱格式错误',
                        },
                    ]}
                />
                <ProFormCaptcha
                    fieldProps={{
                        prefix: <LockOutlined className={'prefixIcon'} />,
                    }}
                    placeholder={'请输入验证码'}
                    captchaTextRender={(timing, count) => {
                        if (timing) {
                            return `${count}s ${'获取验证码'}`
                        }
                        return '获取验证码'
                    }}
                    phoneName="email"
                    name="captcha"
                    rules={[
                        {
                            required: true,
                            message: '请输入验证码',
                        },
                    ]}
                    onGetCaptcha={async (email) => {
                        try {
                            await sendEmailCode(email)
                            messageApi.success('验证码已发送')
                        } catch (error: any) {
                            messageApi.error(error.message || '获取验证码失败，请重试')
                        }
                    }}
                />
            </ProForm> : <div className='text-sm text-neutral-400'>
                {userInfo?.email ? userInfo?.email : '未设置邮箱'}
            </div>}
        </div>
    </div>)
}

export default ChangePhoneForm