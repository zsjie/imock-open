import { ProFormText } from '@ant-design/pro-components'
import { theme } from 'antd'

const PasswordConfirm: React.FC<{
    size?: 'middle' | 'small' | 'large'
    showLabel?: boolean
}> = ({ size = 'middle', showLabel = true }) => {
    const { token } = theme.useToken()
    return <>
        <ProFormText.Password
            label={showLabel ? '新密码' : ''}
            name="newPassword"
            placeholder="请输入新密码"
            rules={[
                { required: true, message: '请输入新密码' },
                {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&-_]{8,}$/,
                    message: '密码必须包含字母、数字，且长度不少于 8 位',
                },
            ]}
            fieldProps={{
                size,
                strengthText:
                            '密码必须包含字母、数字，且长度不少于 8 位',
                statusRender: (value) => {
                    const getStatus = () => {
                        if (value && value.length > 12) {
                            return 'ok'
                        }
                        if (value && value.length > 6) {
                            return 'pass'
                        }
                        return 'poor'
                    }
                    const status = getStatus()
                    if (status === 'pass') {
                        return (
                            <div style={{ color: token.colorWarning }}>
                                            强度：中
                            </div>
                        )
                    }
                    if (status === 'ok') {
                        return (
                            <div style={{ color: token.colorSuccess }}>
                                            强度：强
                            </div>
                        )
                    }
                    return (
                        <div style={{ color: token.colorError }}>强度：弱</div>
                    )
                },
            }}
        />
        <ProFormText.Password
            label={showLabel ? '确认密码' : ''}
            name="confirmPassword"
            placeholder={'请再次输入新密码'}
            fieldProps={{
                size,
            }}
            rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve()
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                }),
            ]}
        />
    </>
}

export default PasswordConfirm