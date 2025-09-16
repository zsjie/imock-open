import dayjs from 'dayjs'
import { forwardRef, useImperativeHandle, useState } from 'react'

import momentExampleData from '../example-data/moment-example-data.json'

export interface Moment {
    // 用户信息
    userId: string
    nickname: string
    avatar: string

    // 内容信息
    id: string
    content: string
    images: string[]
    createdAt: string

    // 互动数据
    likeCount: number
    commentCount: number
}

// 定义 ref 暴露的方法类型
export interface MomentListRef {
    refresh: () => void
}

const MomentItem = ({ moment }: { moment: Moment }) => (
    <div className="w-72 bg-white mb-12">
        <div className="flex items-start mb-3">
            <img src={moment.avatar} alt={moment.nickname} className="w-12 h-12 rounded mr-3" />
            <div className="flex-1">
                <h3 className="font-bold text-left line-clamp-1">{moment.nickname}</h3>
                <p className="mb-3 text-left">{moment.content}</p>
                <div className="mb-3">
                    <div className="flex">
                        {moment.images.map((img, index) => (
                            <div key={index} className="aspect-square mr-1">
                                <img 
                                    src={img} 
                                    alt="" 
                                    className="w-12 h-12 object-cover" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{dayjs(moment.createdAt).format('M月D日')}</span>
            <button className="text-gray-400 px-2">•••</button>
        </div>
    </div>
)

// 从 momentExample 中随机获取两条
function getRandomMoments() {
    const shuffled = [...momentExampleData]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
    return shuffled
}

const MomentsList = forwardRef<MomentListRef>((_props, ref) => {
    // 使用内部状态管理朋友圈列表
    const [moments, setMoments] = useState(() => getRandomMoments())

    // 通过 ref 暴露 refresh 方法
    useImperativeHandle(ref, () => ({
        refresh: () => setMoments(getRandomMoments())
    }))

    return (
        <div>
            {moments.map((moment) => (
                <MomentItem key={moment.id} moment={moment} />
            ))}
        </div>
    )
})

export default MomentsList
