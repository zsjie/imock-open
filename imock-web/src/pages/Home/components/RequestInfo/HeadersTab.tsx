import { Collapse, CollapseProps } from 'antd'
import { useState } from 'react'

import Highlight from '~/components/Highlight'

import { RequestDetail } from '../LogItem'

interface HeadersTabProps {
    requestDetail: RequestDetail;
  }
  
const HeadersTab = ({
    requestDetail,
}: HeadersTabProps) => {
    const [activeKey, setActiveKey] = useState<string[]>(['1', '2'])
    const { responseHeaders, requestHeaders } = requestDetail
    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Response Headers',
            children: <div className='w-full overflow-x-hidden' >
                <Highlight lang="json" code={JSON.stringify(responseHeaders, null, 4)} />
            </div>,
        },
        {
            key: '2',
            label: 'Request Headers',
            children: <div className='w-full overflow-x-hidden' >
                <Highlight lang="json" code={JSON.stringify(requestHeaders, null, 4)} />
            </div>,
        },
    ]

    const onActiveKeyChange = (keys: string[]) => {
        setActiveKey(keys)
    }

    return (
        <div className='overflow-scroll h-[calc(100vh-156px)]'>
            <Collapse
                items={items}
                className='border-none bg-gray-50 rounded-none ant-collapse-border-light'
                activeKey={activeKey}
                onChange={onActiveKeyChange}
            />
        </div>
    )
}

export default HeadersTab
