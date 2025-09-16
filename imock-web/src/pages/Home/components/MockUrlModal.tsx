import { CheckCircleFilled } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Input, InputRef, message, Modal, Space, Tabs } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'

import { listMockUrls, setMockUrls as setMockUrlRequest } from '~/services'
import { checkUrl, UrlCheckError } from '~/utils'

interface MockUrlModalProps {
    isModalOpen: boolean;
    onOk?: () => void;
    onCancel?: () => void;
}

const MockUrlModal: FC<MockUrlModalProps> = ({
    isModalOpen,
    onOk,
    onCancel,
}) => {
    const [messageApi, contextHolder] = message.useMessage()
    const inputRef = useRef<InputRef | null>(null)

    const [mockUrls, setMockUrls] = useState<Record<string, string>>({
        dev: '',
        test: '',
        pre: '',
        prod: ''
    })
    const [mockUrlsSaved, setMockUrlsSaved] = useState<Record<string, boolean>>({
        dev: false,
        test: false,
        pre: false,
        prod: false
    })
    const [mockUrlErrors, setMockUrlErrors] = useState<Record<string, string>>({
        dev: '',
        test: '',
        pre: '',
        prod: ''
    })
    const [activeEnv, setActiveEnv] = useState<string>('test')

    const { runAsync: saveMockUrl, loading } = useRequest(setMockUrlRequest, {
        manual: true,
        onSuccess: () => {
            setMockUrlsSaved(prev => ({
                ...prev,
                [activeEnv]: true
            }))
            messageApi.success('已保存')
        }
    })

    const fetchMockUrls = useRequest(listMockUrls, {
        manual: true,
        onSuccess(res) {
            const newMockUrls: Record<string, string> = {}
            const newMockUrlsSaved: Record<string, boolean> = {}
            
            res?.urls?.forEach(item => {
                if (item.url && item.env) {
                    newMockUrls[item.env] = item.url
                    newMockUrlsSaved[item.env] = true
                }
            })
            
            setMockUrls(prev => ({
                ...prev,
                ...newMockUrls
            }))
            setMockUrlsSaved(prev => ({
                ...prev,
                ...newMockUrlsSaved
            }))
        }
    })

    const onSaveMockUrl = async () => {
        const url = mockUrls[activeEnv]
        const checkResult = checkUrl(url)
        if (!checkResult.isValid) {
            const message = {
                [UrlCheckError.IP_NOT_ALLOWED]: '不允许 IP 地址，请输入域名',
                [UrlCheckError.INVALID_URL]: '请输入正确的 URL 地址',
            }[checkResult.message!] || ''
            setMockUrlErrors(prev => ({
                ...prev,
                [activeEnv]: message
            }))
            return
        }

        await saveMockUrl({
            urls: Object.entries(mockUrls)
                .filter(([_, url]) => url)
                .map(([env, url]) => ({
                    url,
                    env,
                }))
        })

        onOk?.()
    }

    const resetInput = () => {
        setMockUrls({
            dev: '',
            test: '',
            pre: '',
            prod: ''
        })
        setMockUrlsSaved({
            dev: false,
            test: false,
            pre: false,
            prod: false
        })
        setMockUrlErrors({
            dev: '',
            test: '',
            pre: '',
            prod: ''
        })
    }

    const handleCancel = () => {
        resetInput()
        onCancel?.()
    }

    const handleOk = async () => {
        await onSaveMockUrl()
    }

    useEffect(() => {
        if (isModalOpen) {
            inputRef.current?.focus()
            fetchMockUrls.runAsync()
        }
    }, [isModalOpen])

    return (
        <Modal
            open={isModalOpen}
            onCancel={handleCancel}
            onOk={handleOk}
            width="45vw"
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={loading} loading={loading}>取消</Button>,
                <Button key="ok" type="primary" onClick={handleOk} disabled={loading} loading={loading}>保存</Button>,
            ]}
        >
            {contextHolder}
            <div className='pt-10 pb-2'>
                <Tabs 
                    activeKey={activeEnv}
                    onChange={key => {
                        setActiveEnv(key)
                        setMockUrlErrors(prev => ({...prev, [key]: ''}))
                    }}
                    items={[
                        { key: 'dev', label: '开发环境' },
                        { key: 'test', label: '测试环境' },
                        { key: 'pre', label: '预发环境' },
                        { key: 'prod', label: '生产环境' },
                    ]}
                />
                <Space.Compact className='w-full mt-4'>
                    <Input 
                        prefix={mockUrlsSaved[activeEnv] ? <CheckCircleFilled style={{ color: '#44995C' }} /> : <span />} 
                        value={mockUrls[activeEnv]}
                        ref={inputRef}
                        onChange={e => {
                            setMockUrlErrors(prev => ({...prev, [activeEnv]: ''}))
                            setMockUrls(prev => ({...prev, [activeEnv]: e.target.value}))
                            setMockUrlsSaved(prev => ({...prev, [activeEnv]: false}))
                        }} 
                        onPressEnter={onSaveMockUrl}
                        placeholder={`输入${activeEnv}环境的 fallback url`}
                        autoFocus
                        disabled={loading} 
                    />
                </Space.Compact>
                {mockUrlErrors[activeEnv] && <div className='text-red-500 text-sm text-[12px] py-2 px-4'>{mockUrlErrors[activeEnv]}</div>}
                <div className='pt-4 pb-2'>
                    <ul className='list-disc pl-4 text-gray-400 text-sm'>
                        <li>接口没有配置 mock 时，将转发至服务端地址；</li>
                        <li className='pt-1'>严禁输入赌博、诈骗、色情或暴力等非法地址，一经发现立即封停账号，相关证据提交公安机关！禁止用于免流、翻墙、论坛等应用。</li>
                    </ul>
                </div>
            </div>
        </Modal>
    )
}

export default MockUrlModal
