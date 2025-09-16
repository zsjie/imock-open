import { DEFAULT_AVATAR_URL, LOGO_URL } from '@/lib/constants'
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { ProLayout } from '@ant-design/pro-components'
import { Button, Dropdown } from 'antd'
import { FC, PropsWithChildren } from 'react'

import { useUserStore } from '~/store'

const Layout: FC<PropsWithChildren> = ({ children }) => {
    const { userInfo } = useUserStore()
    const { clearUserInfo } = useUserStore()

    return (
        <ProLayout
            splitMenus
            logo={<img
                src={LOGO_URL}
                alt='logo'
                onClick={() => window.location.href = '/'}
            />}
            title=""
            token={{
                colorBgAppListIconHover: 'rgba(0,0,0,0.06)',
                colorTextAppListIconHover: 'rgba(255,255,255,0.95)',
                colorTextAppListIcon: 'rgba(255,255,255,0.85)',
                bgLayout: '#fff',
                pageContainer: {
                    paddingBlockPageContainerContent: 0,
                    paddingInlinePageContainerContent: 0,
                    colorBgPageContainer: '#fff',
                },
                header: {
                    colorBgHeader: '#fff',
                    colorBgRightActionsItemHover: 'rgba(0,0,0,0.06)',
                    colorTextRightActionsItem: 'rgba(255,255,255,0.65)',
                    colorHeaderTitle: '#18181b',
                    colorBgMenuItemHover: 'rgba(0,0,0,0.06)',
                    colorBgMenuItemSelected: 'rgba(0,0,0,0.15)',
                    colorTextMenuSelected: '#fff',
                    colorTextMenu: 'rgba(255,255,255,0.75)',
                    colorTextMenuSecondary: 'rgba(255,255,255,0.65)',
                    colorTextMenuActive: 'rgba(255,255,255,0.95)',
                },
            }}
            fixedHeader
            avatarProps={{
                src: userInfo?.avatar || DEFAULT_AVATAR_URL,
                size: 'small',
                render: (_props, dom) => {
                    if (!userInfo) {
                        return <Button type='primary' size='large' onClick={() => window.location.href = '/login'}>登录/注册</Button>
                    }

                    return (<Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'settings',
                                    label: <span><SettingOutlined /><span className='pl-2'>设置</span></span>,
                                    onClick: () => {
                                        if (window.location.pathname === '/settings') {
                                            return
                                        }
                                        window.location.href = '/settings'
                                    },
                                },
                                {
                                    key: 'logout',
                                    label: <span><LogoutOutlined /><span className='pl-2'>退出登录</span></span>,
                                    onClick: () => {
                                        clearUserInfo()
                                        sessionStorage.clear()

                                        window.location.href = '/server/api/auth/logout'
                                    },
                                },
                            ],
                        }}
                    >
                        {dom}
                    </Dropdown>)
                },
            }}
            layout="top"
            actionsRender={() => [
                <a className='inline-block h-11 text-black leading-8 text-sm hover:text-black' target='_blank' href='https://imock.pro/help-center/get-started.html'>使用指引</a>
            ]}
        >
            {children}
        </ProLayout>
    )
}

export default Layout
