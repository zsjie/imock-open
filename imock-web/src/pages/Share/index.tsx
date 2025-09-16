import { CaretRightOutlined } from '@ant-design/icons'
import Editor from '@monaco-editor/react'
import { useRequest } from 'ahooks'
import { Collapse, Typography } from 'antd'
import { useEffect,useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import Nav from '~/components/Nav'
import PageLoading from '~/components/PageLoading'
import { getShareData } from '~/services'

const { Title } = Typography

const isSuccessStatus = (status: string): boolean => {
    const statusCode = parseInt(status)
    return statusCode >= 200 && statusCode < 400
}

const EditorWrapper = ({ code }: { code: string }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [editorHeight, setEditorHeight] = useState('300px')

    useEffect(() => {
        if (containerRef.current) {
            const { height } = containerRef.current.getBoundingClientRect()
            setEditorHeight(`${height}px`)
        }
    }, [])

    return (
        <div className='relative h-[300px] w-full' ref={containerRef}>
            <Editor
                width="100%"
                height={editorHeight}
                defaultLanguage="json"
                value={code}
                options={{
                    selectOnLineNumbers: true,
                    minimap: { enabled: false },
                    readOnly: true,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    )
}

const ShareContent = () => {
    const { shareId } = useParams<{ shareId: string }>()
    
    const { data: shareData, loading, error } = useRequest(
        () => getShareData(shareId!),
        {
            ready: !!shareId,
        }
    )

    if (loading) {
        return <PageLoading />
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Title level={4}>分享内容不存在或已过期</Title>
            </div>
        )
    }

    if (!shareData) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto py-4 md:py-8 px-4">
            {/* TODO 增加 */}
            {/* <Title level={2}>分享的请求</Title> */}

            <Collapse
                defaultActiveKey={['request']}
                ghost
                className="mt-4 md:mt-8 ant-collapse-border-light"
                expandIcon={({ isActive }) => <CaretRightOutlined className='pt-2' rotate={isActive ? 90 : 0} />}
            >
                <Collapse.Panel key="request" header={<div className='flex items-center justify-between'>
                    <div className='text-lg font-bold'>请求信息</div>
                    {shareData.requestTime && (
                        <div className="text-right text-gray-400">
                            请求时间: {new Date(shareData.requestTime).toLocaleString()}
                        </div>
                    )}
                </div>}>
                    <div className="grid gap-4">
                        <div className="flex gap-2 md:gap-8">
                            <div className="text-gray-500 flex-shrink-0">请求网址:</div>
                            <div className="font-mono">{shareData.url}</div>
                        </div>
                        <div className="flex gap-2 md:gap-8">
                            <div className="text-gray-500 flex-shrink-0">请求方法:</div>
                            <div className="font-mono">{shareData.method}</div>
                        </div>
                        <div className="flex gap-2 md:gap-8">
                            <div className="text-gray-500 flex-shrink-0">状态代码:</div>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${isSuccessStatus(shareData.status) ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-mono">{shareData.status}</span>
                            </div>
                        </div>
                    </div>

                    {shareData.requestHeaders && (
                        <>
                            <Collapse
                                defaultActiveKey={['headers']}
                                ghost
                                className="m-0 p-0 inline-block pt-4"
                                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            >
                                <Collapse.Panel
                                    key="headers"
                                    header={<div className='font-bold'>请求标头</div>}
                                    className="p-0"
                                >
                                    <div className="grid gap-2">
                                        {Object.entries(shareData.requestHeaders)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-[120px,1fr] md:grid-cols-[200px,1fr] gap-2 md:gap-4">
                                                    <div className="text-gray-500 flex-shrink-0">{key}:</div>
                                                    <div className="font-mono break-all">{value as string}</div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </Collapse.Panel>
                            </Collapse>
                        </>
                    )}

                    {shareData.requestBody && (
                        <>
                            <Collapse
                                defaultActiveKey={['body']}
                                ghost
                                className="m-0 p-0"
                                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                                items={[{
                                    key: 'body',
                                    label: <div className='font-bold'>请求体</div>,
                                    children: <EditorWrapper code={JSON.stringify(shareData.requestBody, null, 4)} />
                                }]}
                            />
                        </>
                    )}
                </Collapse.Panel>
            </Collapse>

            <Collapse
                defaultActiveKey={['response']}
                ghost
                className="mt-4 ant-collapse-border-light"
                expandIcon={({ isActive }) => <CaretRightOutlined className='pt-2' rotate={isActive ? 90 : 0} />}
            >
                <Collapse.Panel key="response" header={<div className='flex flex-col md:flex-row md:items-center md:justify-between'>
                    <div className='text-lg font-bold'>响应信息</div>
                    {shareData.responseTime && (
                        <div className="text-gray-400 mt-1 md:mt-0 md:text-right">
                            {shareData.requestTime && (
                                <div className="mt-1 md:mt-0 md:inline md:ml-4 text-gray-700">
                                    <span className="pr-4">耗时: {shareData.responseTime - shareData.requestTime}ms</span>
                                </div>
                            )}
                            <div className="md:inline">响应时间: {new Date(shareData.responseTime).toLocaleString()}</div>
                        </div>
                    )}
                </div>}>
                    {shareData.responseHeaders && (
                        <>
                            <Collapse
                                defaultActiveKey={['headers']}
                                ghost
                                className="m-0 p-0 inline-block"
                                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            >
                                <Collapse.Panel key="headers" header={<div className='font-bold'>响应标头</div>} className="p-0">
                                    <div className="grid gap-2">
                                        {Object.entries(shareData.responseHeaders)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-[120px,1fr] md:grid-cols-[200px,1fr] gap-2 md:gap-4">
                                                    <div className="text-gray-500 flex-shrink-0">{key}:</div>
                                                    <div className="font-mono break-all">{value as string}</div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </Collapse.Panel>
                            </Collapse>
                        </>
                    )}

                    <Collapse
                        defaultActiveKey={['body']}
                        ghost
                        className="m-0 p-0"
                        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                        items={[{
                            key: 'body',
                            label: <div className='font-bold'>响应体</div>,
                            children: <EditorWrapper code={JSON.stringify(shareData.responseBody, null, 4)} />
                        }]}
                    />
                </Collapse.Panel>
            </Collapse>
        </div>
    )
}

const Share = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Nav />
            <div className="flex-grow">
                <ShareContent />
            </div>
        </div>
    )
}

export default Share 