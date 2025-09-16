import { Button, ConfigProvider, Divider, message, Space, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

import { deleteApiMock, getApiMockList, startApiMock, stopApiMock } from '~/services'
import { ApiMockItem } from '~/services/types'
import { getUrl } from '~/utils'

import { RequestDetail } from '../LogItem'
import AddMockModal from './AddMockModal'

const { Column } = Table

interface MockTabProps {
  requestDetail: RequestDetail;
  shouldRefresh?: boolean;
  onRefreshOver?: () => void;
}

interface MockItem extends ApiMockItem {
  key: number;
  requestDetail: RequestDetail;
}

function formatApiMockList(mockList: ApiMockItem[]): MockItem[] {
    return mockList.map(item => ({
        ...item,
        key: item.id,
        requestDetail: {
            id: item.id,
            url: item.url,
            name: item.name,
            method: item.method,
            responseHeaders: JSON.parse(item.headers),
            responseBody: JSON.parse(item.body),
            status: item.statusCode,
            delay: item.delay,
        },
    }))
}

export function MockTab({ requestDetail, shouldRefresh = true, onRefreshOver }: MockTabProps) {
    const [mockList, setMockList] = useState<MockItem[]>([])
    const [currentMock, setCurrentMock] = useState<RequestDetail | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchData = async () => {
        const { url, method } = requestDetail
        const resp = await getApiMockList({
            url: getUrl(url),
            method,
        })
        setMockList(formatApiMockList(resp.mocks))
        onRefreshOver?.()
    }

    const handleOk = () => {
        setIsModalOpen(false)
        fetchData()
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        setCurrentMock(null)
    }

    useEffect(() => {
        if (shouldRefresh) {
            fetchData()
        }
    }, [shouldRefresh])

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (currentMock) {
            setIsModalOpen(true)
        }
    }, [currentMock])

    const [messageApi, contextHolder] = message.useMessage()

    const onEdit = (requestDetail: RequestDetail) => {
        setCurrentMock(requestDetail)
    }

    const onDelete = async (id: number) => {
        try {
            await deleteApiMock(id)
            fetchData()
            messageApi.open({
                type: 'success',
                content: '删除成功',
            })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: '删除失败，请稍后重试',
            })
        }
    }

    const onStart = async (id: number) => {
        try {
            await startApiMock(id)
            fetchData()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: '启动失败，请稍后重试',
            })
        }
    }

    const onStop = async (id: number) => {
        try {
            await stopApiMock(id)
            fetchData()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: '暂停失败，请稍后重试',
            })
        }
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerBorderRadius: 0,
                    }
                }
            }}
        >
            <div
                style={{
                    height: 'calc(100vh - 137px)',
                    overflow: 'scroll',
                    position: 'relative',
                }}
            >
                {contextHolder}
                <Table dataSource={mockList}>
                    <Column
                        title="Mock 名称"
                        dataIndex="name"
                        key="name"
                        render={(text: string, record: MockItem) => <div>{text || record.url}</div>}
                    />
                    <Column title="URL" dataIndex="url" key="url" />
                    <Column
                        title="运行状态"
                        dataIndex="running"
                        key="running"
                        render={(running: number) =>
                            running ? (
                                <Tag bordered={false} color="success">
                                Running
                                </Tag>
                            ) : (
                                <Tag bordered={false} color="default">
                                Stopped
                                </Tag>
                            )
                        }
                    />
                    <Column
                        title="操作"
                        key="action"
                        fixed="right"
                        render={(_: any, record: MockItem) => (
                            <Space split={<Divider type="vertical" />}>
                                {record.running ? (
                                    <Button type="link" onClick={() => onStop(record.id)}>暂停</Button>
                                ) : (
                                    <Button type="link" onClick={() => onStart(record.id)}>启动</Button>
                                )}
                                <Button type="link" onClick={() => {
                                    setIsModalOpen(true)
                                    onEdit(record.requestDetail)
                                }}>编辑</Button>
                                <Button type="link" onClick={() => onDelete(record.id)} danger>删除</Button>
                            </Space>
                        )}
                    />
                </Table>
                <AddMockModal
                    isModalOpen={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    requestDetail={currentMock}
                    mode="edit"
                />
            </div>
        </ConfigProvider>
    )
}
