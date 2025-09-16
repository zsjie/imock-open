import ProForm, { ProFormText } from '@ant-design/pro-form'
import { Button, Divider,message } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import PasswordConfirm from '~/components/PasswordConfirm'
import { setPassword } from '~/services/user'
import { useUserStore } from '~/store'


const ChangePasswordForm: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage()
    const [updatePassword, setUpdatePassword] = useState(false)

    const { userInfo, refreshUserInfo } = useUserStore()

    const handleSubmit = async (values: { newPassword: string; confirmPassword: string; oldPassword?: string; }) => {
        if (values.newPassword !== values.confirmPassword) {
            messageApi.error('两次输入的密码不一致')
            return
        }

        try {
            await setPassword({
                password: values.newPassword,
                oldPassword: values.oldPassword,
            })
            setUpdatePassword(false)
            refreshUserInfo()
            messageApi.success('密码设置成功')
        } catch (error: any) {
            messageApi.error(error?.message || '密码修改失败，请重试')
        }
    }

    return (<div className='pb-6'>
        {contextHolder}
        <h2 className='font-bold text-lg flex justify-between'>
            <div>密码</div>
            <div>
                <Button onClick={() => { 
                    setUpdatePassword(!updatePassword)
                }}>{updatePassword ? '收起' : (userInfo?.isSetPassword ? '修改密码' : '设置密码')}</Button>
            </div>
        </h2>
        <Divider className='mt-3' />
        <div>
            { updatePassword ? <ProForm
                className='w-64'
                onFinish={handleSubmit}
                submitter={{
                    render: (props) => {
                        return [
                            <div className='flex items-center'>
                                <Button
                                    type="default"
                                    onClick={() => props.form?.submit()}
                                    key="submit"
                                >
                                    {userInfo?.isSetPassword ? '修改密码' : '设置密码'}
                                </Button>
                                <div className='pl-4'>
                                    <Link className='text-sm text-neutral-400' to="/password-reset" target='_blank'>忘记密码？</Link>
                                </div>
                            </div>,
                        ]
                    }
                }}
            >
                {userInfo?.isSetPassword && <ProFormText.Password
                    label="旧密码"
                    name="oldPassword"
                    placeholder="请输入旧密码"
                    rules={[
                        { required: userInfo?.isSetPassword, message: '请输入旧密码' },
                    ]}
                />}

                <PasswordConfirm />

            </ProForm> : <div className='text-sm text-neutral-400'>
                {userInfo?.isSetPassword ? '你已设置密码' : '你还未设置密码'}。你可以通过设置高强度的密码来保护你的账号安全。
            </div>}
        </div>
    </div>)
}

export default ChangePasswordForm