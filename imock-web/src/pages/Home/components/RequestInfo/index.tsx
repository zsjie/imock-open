import { Button, Flex, Tabs, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

import { useUserStore } from '~/store'

import { RequestDetail } from '../LogItem'
import AddMockModal from './AddMockModal'
import HeadersTab from './HeadersTab'
import { MockTab } from './MockTab'
import RequestTab from './RequestTab'

interface RequestInfoProps {
  index: number;
  detail: RequestDetail | null;
}

function IntroLink() {
    const { userInfo } = useUserStore()
    
    return <div className='h-full flex justify-center'>
        <div className='pt-[20vh]'>
            <div>
                <h2 className='font-bold'>快速体验</h2>
                <p className='pl-3'>
                    <a href="https://imock.pro/imock-todo/home" target='_blank'>通过 web 应用体验</a>
                </p>
                <p className='pl-3'>
                    <Tooltip color='#fff' placement='bottom' title={userInfo?.wxacode ? <div>
                        <img className='w-[128px] h-[128px]' src={userInfo?.wxacode} alt="小程序码" />
                    </div> : <div className='text-xs text-gray-500 text-center'>在微信中搜索 imock todo 小程序进行体验</div>}
                    >
                        <a href="#">通过小程序体验</a>
                    </Tooltip>
                </p>
            </div>
            <div className='pt-4'>
                <h2 className='font-bold'>快速接入</h2>
                <p className='pl-3'>
                    <a href="https://imock.pro/help-center/get-started.html">使用指引</a>
                </p>
            </div>
        </div>
    </div>
}

export default function RequestInfo({ index, detail }: RequestInfoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [shouldRefreshMock, setShouldRefreshMock] = useState(true)
    const [activeTab, setActiveTab] = useState('response')

    const showModal = () => {
        setIsModalOpen(true)
    }

    const handleOk = () => {
        setIsModalOpen(false)
        setShouldRefreshMock(true)
    }

    const handleCancel = () => {
        setIsModalOpen(false)
    }

    const handleRefreshOver = () => {
        setShouldRefreshMock(false)
    }

    useEffect(() => {
        setActiveTab('response')
        setShouldRefreshMock(true)
    }, [index])

    return (
        <div className='relative h-full'>
            <div
                className='tab-list-no-mb'
                style={{
                    background: '#fff',
                    width: '100%',
                }}
            >
                {detail ? (
                    <Tabs
                        defaultActiveKey={activeTab}
                        onChange={key => setActiveTab(key)}
                        activeKey={activeTab}
                        items={[
                            {
                                key: 'response',
                                label: <div className='px-4'>Response</div>,
                                children: <RequestTab requestDetail={detail} type="response" />,
                            },
                            {
                                key: 'request',
                                label: <div className='px-4'>Request</div>,
                                children: <RequestTab requestDetail={detail} type="request" />,
                            },
                            {
                                key: 'headers',
                                label: <div className='px-4'>Headers</div>,
                                children: <HeadersTab requestDetail={detail} />,
                            },
                            {
                                key: 'mock-list',
                                label: <div className='px-4'>Mock</div>,
                                children: (
                                    <MockTab
                                        shouldRefresh={shouldRefreshMock}
                                        requestDetail={detail}
                                        onRefreshOver={handleRefreshOver}
                                    />
                                ),
                            },
                        ].map(item => {
                            if (item.key === 'request' && !detail.requestBody) {
                                return null
                            }

                            return item
                        }).filter(Boolean) as any}
                    />
                ) : (<IntroLink />)}
            </div>
            {detail && (
                <div
                    className='absolute bottom-0 left-0 w-full h-[55px] bg-white border-t border-[#e5e7eb]'
                >
                    <Flex
                        align="center"
                        justify="flex-end"
                        className='h-full px-3'
                    >
                        <Button type="primary" onClick={showModal}>
                            添加 Mock
                        </Button>
                    </Flex>
                </div>
            )}
            <AddMockModal
                isModalOpen={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                requestDetail={detail}
            />
        </div>
    )
}
