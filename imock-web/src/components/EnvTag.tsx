import { ConfigProvider, Tag } from 'antd'

import { MockEnv } from '~/lib/constants'

const EnvTag = ({ env, disabled }: { env: MockEnv, disabled?: boolean }) => {
    const tag = (() => {switch (env) {
    case MockEnv.dev:
        return <Tag color={disabled ? 'default' : '#006acf'} bordered={!disabled} className={disabled ? 'opacity-50' : ''} title={disabled ? '未配置开发环境地址' : ''}>开发环境</Tag>
    case MockEnv.test:
        return <Tag color={disabled ? 'default' : '#d15500'} bordered={!disabled} className={disabled ? 'opacity-50' : ''} title={disabled ? '未配置测试环境地址' : ''}>测试环境</Tag>
    case MockEnv.pre:
        return <Tag color={disabled ? 'default' : '#4100a0'} bordered={!disabled} className={disabled ? 'opacity-50' : ''} title={disabled ? '未配置预发环境地址' : ''}>预发环境</Tag>
    case MockEnv.prod:
        return <Tag color={disabled ? 'default' : '#2b8500'} bordered={!disabled} className={disabled ? 'opacity-50' : ''} title={disabled ? '未配置生产环境地址' : ''}>生产环境</Tag>
    default:
        return <Tag color='default'>无服务端</Tag>
    }})()

    return <div className='-mt-[2px]'>
        <ConfigProvider theme={{
            token: {
                fontSize: 12
            }
        }}>
            {tag}
        </ConfigProvider>
    </div>
}

export default EnvTag
