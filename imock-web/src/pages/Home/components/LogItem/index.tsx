import { CheckOutlined, CopyOutlined, RobotFilled, ShareAltOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Badge, Flex, message, Popconfirm, Tag, Tooltip } from 'antd'
import classNames from 'classnames'
import copy from 'copy-to-clipboard'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import EnvTag from '~/components/EnvTag'
import { shareRequest, updateAIMockSwitch } from '~/services'
import { joinUrl } from '~/utils'
import { getMethodColor } from '~/utils/color'

export interface RequestDetail {
  id?: number;
  method: string;
  status: string;
  url: string;
  name?: string;
  delay?: number;
  requestTime?: number;
  responseTime?: number;
  requestBody?: ObjectAny;
  responseBody: ObjectAny;
  requestHeaders?: ObjectAny;
  responseHeaders: ObjectAny;
  aiMockRunning?: boolean;
}

interface LogItemProps {
  log: RequestDetail;
  onClick?: () => void;
  active?: boolean;
  onSwitchAIMock?: (data: { url: string, method: string, aiMockRunning: boolean }) => void;
}

function MockBadge({ isMock, isAIMock }: { isMock: boolean, isAIMock: boolean }) {
    if (isAIMock) {
        return <Tooltip title="Mocked By AI">
            <span><Badge color="#a271e6" text="" /></span>
        </Tooltip>
    }

    if (isMock) {
        return <Tooltip title="Mocked">
            <span><Badge color="lime" text="" /></span>
        </Tooltip>
    }

    return <Badge style={{ visibility: 'hidden' }} color="transparent" text="" />
}

export function LogItem({ log, onClick, active, onSwitchAIMock }: LogItemProps) {
    const { method, url, requestTime, responseHeaders, aiMockRunning } = log
    const isMock = responseHeaders['x-mocked-by-imock'] === 'true'
    const isAIMock = responseHeaders['x-mocked-by-imock-ai'] === 'true'
    const mockEnv = responseHeaders['x-imock-backend-env']
    const backendUrl = responseHeaders['x-imock-backend-url'] || ''
    const displayUrl = joinUrl(backendUrl, url)
    const status = parseInt(log.status, 10)
    const [messageApi, contextHolder] = message.useMessage()
    const [menuVisible, setMenuVisible] = useState(false)
    const [sharePopoverVisible, setSharePopoverVisible] = useState(false)
    const [shareUrl, setShareUrl] = useState(window.location.host + '/share/' + 'x'.repeat(10))
    const [shareCopied, setShareCopied] = useState(false)

    const [localAiMockRunning, setLocalAIMockRunning] = useState(typeof aiMockRunning !== 'undefined' ? aiMockRunning : isAIMock)

    const { runAsync: updateAIMockSwitchAsync } = useRequest(updateAIMockSwitch, {
        manual: true,
        onSuccess: () => {
            setLocalAIMockRunning(!localAiMockRunning)
            onSwitchAIMock?.({
                url,
                method,
                aiMockRunning: !localAiMockRunning,
            })
        }
    })

    const { runAsync: shareRequestAsync } = useRequest(shareRequest, {
        manual: true,
        onSuccess: (data) => {
            console.log(data)
            setSharePopoverVisible(true)
            setShareUrl(data.shareUrl)
        }
    })

    const handleAIMagicClick = async () => {
        try {
            await updateAIMockSwitchAsync({
                url,
                method,
                aiMockRunning: !localAiMockRunning,
            })
        } catch (_error) {
            messageApi.error('更新 AI Mock 失败')
        }
    }

    const handleShareClick = async () => {
        if (sharePopoverVisible) {
            return
        }

        try {
            await shareRequestAsync({
                url: displayUrl,
                method,
                requestBody: log.requestBody,
                responseBody: log.responseBody,
                requestHeaders: log.requestHeaders,
                responseHeaders: log.responseHeaders,
                requestTime: log.requestTime,
                responseTime: log.responseTime,
                status: log.status,
            })
        } catch (_error) {
            messageApi.error('创建分享链接失败')
        }
    }

    const handleCopyClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        copy(shareUrl)
        setShareCopied(true)
        setTimeout(() => {
            setShareCopied(false)
        }, 1000)
    }

    useEffect(() => {
        setLocalAIMockRunning(typeof aiMockRunning !== 'undefined' ? aiMockRunning : isAIMock)
    }, [aiMockRunning, isAIMock])

    return (
        <Flex
            className={classNames('relative group cursor-pointer border-b border-slate-50 py-4 px-3 hover:bg-gray-50 transition-all duration-200 ease-linear font-mono', {
                active,
                'bg-gray-50': active,
            })}
            onClick={() => {
                onClick?.()
            }}
        >
            {contextHolder}

            <div className='w-52'>
                {dayjs(requestTime).format('YYYY-MM-DD HH:mm:ss')}
            </div>

            <div className='w-16 font-bold' style={{ color: getMethodColor(method) }}>
                {method}
            </div>
            <div className='w-16'>
                <Tag color={status >= 200 && status < 300 ? 'green' : 'red'}>{status}</Tag>
            </div>
            <div
                title={url}
                className='flex-1 whitespace-nowrap overflow-hidden text-ellipsis pr-16'
            >
                {url}
            </div>
            <div
                className="mock-badge absolute right-4 flex items-center gap-1
                group-hover:bg-gray-50 group[.active]:bg-gray-50
                transition-all duration-200 ease-linear"
            >
                <div className={`relative pl-4 opacity-0 group-hover:opacity-100 ${menuVisible || sharePopoverVisible ? 'opacity-100' : ''}`} onClick={(e) => {
                    e.stopPropagation()
                    handleShareClick()
                }}>
                    <Popconfirm
                        open={sharePopoverVisible}
                        zIndex={910}
                        title={<div className='font-bold'>分享链接 7 天内有效，获得链接的用户可以查看请求信息</div>}
                        description={<div>
                            <div className='cursor-pointer font-mono text-sm bg-gray-100 p-2 rounded-md' onClick={handleCopyClick}>
                                <Tooltip title={shareCopied ? '已复制' : '复制到剪贴板'}>
                                    <span>
                                        <span className='mr-2'>{shareUrl}</span>
                                        {shareCopied ? <CheckOutlined className='text-green-500' /> : <CopyOutlined />}
                                    </span>
                                </Tooltip>
                            </div>
                        </div>}
                        showCancel={false}
                        okButtonProps={{ style: { display: 'none' } }}
                        icon={null}
                        onOpenChange={(open) => {
                            setSharePopoverVisible(open)
                        }}
                    >
                        <Tooltip title="分享请求" zIndex={900} onOpenChange={(open) => {
                            setMenuVisible(open)
                        }}>
                            <span><ShareAltOutlined /></span>
                        </Tooltip>
                    </Popconfirm>
                </div>
                <div className={`relative pl-4 mr-4 opacity-0 group-hover:opacity-100 ${menuVisible || sharePopoverVisible ? 'opacity-100' : ''}`} onClick={(e) => {
                    e.stopPropagation()
                    handleAIMagicClick()
                }}>
                    <Tooltip
                        title={localAiMockRunning ? '关闭 AI Mock' : '开启 AI Mock'}
                        zIndex={900}
                        onOpenChange={(open) => {
                            setMenuVisible(open)
                        }}
                    >
                        <span><RobotFilled className={`${localAiMockRunning ? 'text-[#a271e6]' : 'text-[#92979E]'}`} /></span>
                    </Tooltip>
                </div>

                {mockEnv ? <div className='opacity-20 -mr-2'>
                    <Tooltip title={backendUrl} zIndex={900}>
                        <span><EnvTag env={mockEnv} /></span>
                    </Tooltip>
                </div> : <MockBadge isMock={isMock} isAIMock={isAIMock} />}
            </div>
        </Flex>
    )
}
