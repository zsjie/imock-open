import { useEffect, useState } from 'react'

const SlideTitles = () => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const texts = ['查看请求日志，轻松调试客户端请求', '支持模拟请求，便捷复现场景', '集成 Mock.js，灵活生成多样数据']

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return <div>
        {texts.map((text, index) => 
            (<div key={index} className={`animate-in slide-in-from-bottom-1 duration-500 ${currentTextIndex === index ? '': 'hidden'}`}>{text}</div>)
        )}
    </div>
}

export default SlideTitles