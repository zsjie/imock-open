import MonacoEditor from '@monaco-editor/react'
import { useRequest } from 'ahooks'
import { Button, Col, message, Modal, Row } from 'antd'
import { FC, useState } from 'react'

import logger from '~/lib/logger'
import { generateBySchema } from '~/services'

interface GenerateBySchemaModalProps {
  isModalOpen: boolean;
  onOk?: (result: string) => void;
  onCancel?: () => void;
}

const GenerateBySchemaModal: FC<GenerateBySchemaModalProps> = ({ isModalOpen, onOk, onCancel }) => {
    const [schema, setSchema] = useState<string>('// 输入 TS 类型定义')
    const [result, setResult] = useState<string>('')
    const [messageApi, contextHolder] = message.useMessage()

    const { runAsync: fetchMockData, loading } = useRequest(generateBySchema, {
        manual: true,
    })

    const resetEditor = () => {
        setSchema('// 输入 TS 类型定义')
        setResult('')
    }

    const handleOk = () => {
        resetEditor()
        onOk?.(result)
    }

    const handleCancel = () => {
        resetEditor()
        onCancel?.()
    }

    const handleSchemaChange = (value = '') => {
        setSchema(value)
    }

    const handleResultChange = (value = '') => {
        setResult(value)
    }

    const onGenerate = async () => {
        try {
            const res = await fetchMockData(schema)
            setResult(JSON.stringify(res, null, 4))
        } catch (error: any) {
            logger.error(error)
            messageApi.error('生成失败')
        }
    }

    return (
        <Modal
            title="Generate By Schema"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={960}
            okText="应用"
            footer={[
                <Button key="cancel" onClick={handleCancel}>
          取消
                </Button>,
                <Button key="gen" type="primary" onClick={onGenerate}>
          生成
                </Button>,
                <Button key="apply" type="primary" loading={loading} onClick={handleOk}>
          应用
                </Button>,
            ]}
        >
            {contextHolder}
            <Row>
                <Col span={12}>
                    <MonacoEditor
                        width="450"
                        height="515"
                        language="typescript"
                        theme="vs-light"
                        value={schema}
                        options={{
                            selectOnLineNumbers: true,
                            minimap: { enabled: false },
                            readOnly: loading,
                        }}
                        onChange={handleSchemaChange}
                    />
                </Col>
                <Col span={12}>
                    <MonacoEditor
                        width="450"
                        height="515"
                        language="json"
                        theme="vs-light"
                        value={result}
                        options={{
                            selectOnLineNumbers: true,
                            minimap: { enabled: false },
                            readOnly: loading,
                        }}
                        onChange={handleResultChange}
                    />
                </Col>
            </Row>
        </Modal>
    )
}

export default GenerateBySchemaModal
