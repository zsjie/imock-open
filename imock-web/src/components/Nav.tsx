import { DEFAULT_AVATAR_URL } from '@/lib/constants'
import { DownOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, MenuProps, Space } from 'antd'

import BrandName from '~/components/Logo'
import { useUserStore } from '~/store'
function Nav() {
    const { userInfo } = useUserStore()
    
    const onLogin = () => {
        window.location.href = '/login'
    }

    const onGoToConsole = () => {
        window.location.href = '/home'
    }


    return <div className='relative py-4 px-6 flex justify-between items-center md:flex-row-reverse'>
        <div className='md:absolute md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2'>
            <a href='/'>
                <BrandName />
            </a>
        </div>
        <div className='flex items-center'>
            <div className='hidden md:block pr-4'>
                {userInfo?.userId && <Button className='ml-4' size="large" type="primary" onClick={onGoToConsole}>控制台</Button>}
            </div>
            {userInfo?.userId ? <div className='cursor-pointer'>
                <a href='/home'><Avatar src={userInfo.avatar || DEFAULT_AVATAR_URL} /></a>
            </div> : <div onClick={onLogin}>
                <div className='hidden md:block'>
                    <Button type="primary" size="large">登录/注册</Button>
                </div>
                <div className='md:hidden'>
                    <Button type="text" size="large">登录/注册</Button>
                </div>
            </div>}
        </div>
    </div>
}

export default Nav
