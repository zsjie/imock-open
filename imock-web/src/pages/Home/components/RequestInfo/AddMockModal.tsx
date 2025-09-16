import MonacoEditor from '@monaco-editor/react'
import { Button, Input, message, Modal, Select, Space, Tabs } from 'antd'
import { useEffect, useState } from 'react'

import logger from '~/lib/logger'
import { updateApiMock } from '~/services'
import { getMethodColor } from '~/utils/color'

import { RequestDetail } from '../LogItem'
import GenerateBySchemaModal from './GenerateBySchemaModal'

interface AddMockModalProps {
  isModalOpen: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  requestDetail?: RequestDetail | null;
  mode?: 'add' | 'edit';
}

function validateJSON(jsonString: string) {
    try {
        JSON.parse(jsonString)
        return true
    } catch (_error) {
        return false
    }
}

const AddMockModal: React.FC<AddMockModalProps> = ({
    onCancel,
    onOk,
    isModalOpen,
    requestDetail,
    mode = 'add',
}: AddMockModalProps) => {
    const [body, setBody] = useState<string>(
        JSON.stringify(requestDetail?.responseBody || {}, null, 4),
    )
    const [headers, setHeaders] = useState<string>(
        JSON.stringify(requestDetail?.responseHeaders || {}, null, 4),
    )
    const [name, setName] = useState<string>(requestDetail?.name || '')
    const [status, setStatus] = useState<string>(requestDetail?.status.toString() || '200')
    const [delay, setDelay] = useState<number>(requestDetail?.delay || 0)

    const [loading, setLoading] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage()

    const [generateBySchemaModalVisible, setGenerateBySchemaModalVisible] = useState(false)

    const delayOptions = [
        { value: 0, label: '无延迟' },
        { value: 300, label: '300ms' },
        { value: 1000, label: '1s' },
        { value: 3000, label: '3s' },
        { value: 5000, label: '5s' },
        { value: 10000, label: '10s' },
        { value: 30000, label: '30s' },
    ]

    useEffect(() => {
        if (!requestDetail) {
            return
        }

        setName(requestDetail.name || '')
        setBody(JSON.stringify(requestDetail.responseBody || {}, null, 4))
        setHeaders(JSON.stringify(requestDetail.responseHeaders || {}, null, 4))
        setStatus(requestDetail.status.toString() || '200')
        setDelay(requestDetail.delay || 0)
    }, [requestDetail])

    const resetEditData = () => {
        setBody(JSON.stringify(requestDetail?.responseBody || {}, null, 4))
        setHeaders(JSON.stringify(requestDetail?.responseHeaders || {}, null, 4))
        setName(requestDetail?.name || '')
        setStatus(requestDetail?.status.toString() || '200')
        setDelay(requestDetail?.delay || 0)
    }

    const handleOk = async () => {
        if (loading) {
            return
        }

        if (!validateJSON(headers)) {
            messageApi.open({
                type: 'error',
                content: 'Headers 需要是合法的 JSON 字符串',
            })
            return
        }

        if (JSON.parse(headers)['content-type'] === 'application/json' && !validateJSON(body)) {
            messageApi.open({
                type: 'error',
                content: 'Body 需要是合法的 JSON 字符串',
            })
            return
        }

        try {
            setLoading(true)
            await updateApiMock({
                id: requestDetail?.id,
                name,
                status,
                body,
                headers,
                url: requestDetail?.url || '',
                method: requestDetail?.method || 'GET',
                delay,
            })
            messageApi.open({
                type: 'success',
                content: '添加 Mock 成功',
            })
            resetEditData()
            onOk?.()
        } catch (_error) {
            messageApi.open({
                type: 'error',
                content: '添加 Mock 失败',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        onCancel?.()
    }

    const handleBodyChange = (value = '') => {
        setBody(value)
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStatus(e.target.value)
    }

    const handleDelayChange = (value: number) => {
        setDelay(value)
    }

    const handleGenerateOk = (val: string) => {
        logger.info('generate ok')
        logger.info('old body', body)
        setBody(val)
        setGenerateBySchemaModalVisible(false)
    }

    return (
        <Modal
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width="75vw"
            height="80vh"
            footer={[
                <Button key="cancel" onClick={handleCancel} loading={loading}>取消</Button>,
                <Button key="ok" type="primary" onClick={handleOk} loading={loading}>{mode === 'add' ? '添加 Mock' : '保存修改'}</Button>,
            ]}
        >
            {contextHolder}
            <Space.Compact>
                <Input
                    placeholder="Mock 名称"
                    variant="borderless"
                    value={name}
                    onChange={handleNameChange}
                />
            </Space.Compact>
            <Space.Compact
                size="large"
                style={{
                    width: '100%',
                    margin: '16px 0 4px',
                }}
            >
                <Input
                    addonBefore={
                        <div
                            style={{
                                height: '36px',
                                lineHeight: '36px',
                                padding: '0 8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: getMethodColor(requestDetail?.method || 'GET'),
                            }}
                        >
                            {requestDetail?.method || 'GET'}
                        </div>
                    }
                    placeholder={requestDetail?.url}
                    disabled
                    style={{ width: '90%' }}
                />
                <Input
                    placeholder="status"
                    style={{ width: '10%' }}
                    value={status}
                    onChange={handleStatusChange}
                    disabled={loading}
                />
                <Select className='w-32' options={delayOptions} value={delay} onChange={handleDelayChange} />
            </Space.Compact>
            <div className='tab-list-no-mb'>
                <Tabs
                    defaultActiveKey="body"
                    items={[
                        {
                            key: 'body',
                            label: '响应体',
                            children: (
                                <MonacoEditor
                                    height="45vh"
                                    language="json"
                                    theme="vs-light"
                                    value={body}
                                    options={{
                                        selectOnLineNumbers: true,
                                        minimap: { enabled: false },
                                        readOnly: loading,
                                        wordWrap: 'on',
                                        scrollBeyondLastLine: false,
                                    }}
                                    onChange={handleBodyChange}
                                />
                            ),
                        },
                    // {
                    //   key: 'headers',
                    //   label: 'Headers',
                    //   children: (
                    //     <MonacoEditor
                    //       width="900"
                    //       height="300px"
                    //       language="json"
                    //       theme="vs-light"
                    //       value={headers}
                    //       options={{
                    //         selectOnLineNumbers: true,
                    //         minimap: { enabled: false },
                    //         readOnly: loading,
                    //       }}
                    //       onChange={handleHeadersChange}
                    //     />
                    //   ),
                    // },
                    ]}
                />
            </div>
            <GenerateBySchemaModal
                isModalOpen={generateBySchemaModalVisible}
                onOk={handleGenerateOk}
                onCancel={() => {
                    setGenerateBySchemaModalVisible(false)
                }}
            />
        </Modal>
    )
}

export default AddMockModal
