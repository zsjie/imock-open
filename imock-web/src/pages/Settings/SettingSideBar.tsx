import { SettingOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    {
        key: 'account',
        label: '账户',
        icon: <SettingOutlined />,
    },
]

const SettingSideBar: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()

    // 从 URL 中解析 key
    const selectedKey = location.pathname.split('/').pop()

    const onClick: MenuProps['onClick'] = (e) => {
        navigate(`/settings/${e.key}`)
    }

    return (
        <Menu
            onClick={onClick}
            style={{ width: 256 }}
            selectedKeys={[selectedKey || 'account']}
            mode="inline"
            items={items}
        />
    )
}

export default SettingSideBar