import { Button } from 'antd'

import { useUserStore } from '~/store'

import MockExample from './mock-example'

function Intro({
    className
}: {
    className?: string
}) {
    const { userInfo } = useUserStore()

    const onStartUsing = () => {
        window.location.href = userInfo?.userId ? '/home' : `/login?returnUrl=${encodeURIComponent('/home')}`
    }

    return <div className={`flex justify-center ${className}`}>
        <div className='text-center'>
            <div className="text-gray-600 text-xl md:text-2xl animate-in slide-in-from-bottom-1 duration-200">下一代 mock 工具</div>
            <div className='font-sans font-extrabold text-[28px] sm:text-[42px] md:text-[56px] animate-in slide-in-from-bottom-10 duration-300'>
                AI 驱动，为任意请求生成 mock 数据
            </div>
            <div className='flex justify-center pt-8 animate-in slide-in-from-bottom-16 duration-500'>
                <div className='relative'>
                    <MockExample />
                </div>
            </div>
        </div>
    </div>
}

export default Intro
