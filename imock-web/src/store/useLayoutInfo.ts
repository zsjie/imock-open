import { useEffect,useState } from 'react'

const useLayoutInfo = () => {
    const [headerHeight, setHeaderHeight] = useState<number>(0)

    useEffect(() => {
        const updateHeaderHeight = () => {
            const headerElement = document.querySelector('.ant-layout-header')
            if (headerElement) {
                setHeaderHeight(headerElement.clientHeight)
            }
        }

        // 初始获取导航栏高度
        updateHeaderHeight()

        // 监听窗口大小变化，更新导航栏高度
        window.addEventListener('resize', updateHeaderHeight)

        // 清除事件监听器
        return () => {
            window.removeEventListener('resize', updateHeaderHeight)
        }
    }, [])

    return {
        headerHeight,
    }
}

export default useLayoutInfo