import { ReloadOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import { useRef } from 'react'

import Highlight from '~/components/Highlight'
import { MOCK_ENDPOINT } from '~/lib/constants'
import { useUserStore } from '~/store'

import BillList, { BillListRef } from './components/BillList'
import MomentsList, { MomentListRef } from './components/MomentList'
import MoreDataGuide from './components/MoreDataGuide'
import ProductList, { ProductListRef } from './components/ProductList'
import TodoList, { TodoListRef } from './components/TodoList'

type TabType = 'product' | 'moments' | 'bills' | 'todo' | 'more'

interface TabConfig {
    key: TabType
    label: string
    title: string
    endpoint: string
    resultContent: string | React.ReactNode
    onRefresh?: () => void
}

const TabContent = ({ code, resultContent, onRefresh, title }: { code: string, resultContent: string | React.ReactNode, onRefresh?: () => void, title: string }) => (
    <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-4 md:w-[800px]">
        <div className="w-full md:flex-1 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                {onRefresh && (
                    <Button 
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={onRefresh}
                    >
                        换一批
                    </Button>
                )}
            </div>
            <Highlight className='text-left' lang='js' code={code} />
        </div>
        <div className="w-full md:flex-1 p-4 md:h-[448px]">
            <div>{resultContent}</div>
        </div>
    </div>
)

const MockExample = () => {
    const { userInfo } = useUserStore()

    const productListRef = useRef<ProductListRef>(null)
    const momentListRef = useRef<MomentListRef>(null)
    const billListRef = useRef<BillListRef>(null)
    const todoListRef = useRef<TodoListRef>(null)
    
    const tabConfigs: TabConfig[] = [
        {
            key: 'product',
            label: '商品',
            endpoint: '/products',
            title: '获取随机商品',
            resultContent: <ProductList ref={productListRef} />,
            onRefresh: () => productListRef.current?.refresh()
        },
        {
            key: 'moments',
            label: '朋友圈',
            title: '获取随机朋友圈',
            endpoint: '/moments',
            resultContent: <MomentsList ref={momentListRef} />,
            onRefresh: () => momentListRef.current?.refresh()
        },
        {
            key: 'bills',
            label: '账单',
            title: '获取随机账单',
            endpoint: '/bills',
            resultContent: <BillList ref={billListRef} />,
            onRefresh: () => billListRef.current?.refresh()
        },
        {
            key: 'todo',
            label: '待办事项',
            title: '获取随机待办',
            endpoint: '/todos',
            resultContent: <TodoList ref={todoListRef} />,
            onRefresh: () => todoListRef.current?.refresh()
        },
        {
            key: 'more',
            label: '更多',
            title: '获取更多',
            endpoint: '/any-of-your-url-path',
            resultContent: <MoreDataGuide />
        }
    ]

    const getTabCodeSample = (id: string, endpoint: string) => {
        return `fetch('${MOCK_ENDPOINT}${endpoint}', {
    method: 'GET',
    headers: {
        'x-imock-id': '${id}'
    }
})`
    }

    const items = tabConfigs.map(config => ({
        key: config.key,
        label: config.label,
        children: (
            <TabContent 
                code={getTabCodeSample(userInfo?.userId ? userInfo.userId : 'your-imock-id', config.endpoint)}
                resultContent={config.resultContent}
                onRefresh={config.onRefresh}
                title={config.title}
            />
        )
    }))

    return (
        <div className="flex flex-col w-full">
            <div className='p-4 md:p-0'>
                <Tabs items={items} />
            </div>
        </div>
    )
}

export default MockExample