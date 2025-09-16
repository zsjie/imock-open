import { useRequest } from 'ahooks'
import { Button, message, Modal, Upload } from 'antd'
import { RcFile, UploadFile } from 'antd/es/upload'
import { FC, useState } from 'react'

import { uploadOpenapi } from '~/services'

interface OpenapiModalProps {
    isModalOpen: boolean
    onOk?: () => void
    onCancel?: () => void
}

const OpenapiModal: FC<OpenapiModalProps> = ({
    isModalOpen,
    onOk,
    onCancel,
}) => {
    const [messageApi, contextHolder] = message.useMessage()
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const { runAsync: handleUpload, loading } = useRequest(uploadOpenapi, {
        manual: true,
        onSuccess: () => {
            messageApi.success('导入成功')
            handleCancel()
            onOk?.()
        },
        onError: (err) => {
            messageApi.error(err.message || '导入失败')
        }
    })

    const beforeUpload = (file: RcFile) => {
        const isJSON = file.type === 'application/json'
        if (!isJSON) {
            messageApi.error('只能上传 JSON 文件')
            return Upload.LIST_IGNORE
        }

        // 如果已有文件，先移除
        if (fileList.length > 0) {
            setFileList([])
        }
        
        // 创建完整的 UploadFile 对象
        const uploadFile: UploadFile = {
            uid: file.uid,
            name: file.name,
            status: 'done',
            size: file.size,
            type: file.type,
            originFileObj: file,
        }
        
        setFileList([uploadFile])
        return false // 阻止自动上传
    }

    const handleCancel = () => {
        setFileList([])
        onCancel?.()
    }

    const handleOk = async () => {
        if (!fileList.length) {
            messageApi.error('请先选择文件')
            return
        }

        try {
            const file = fileList[0]
            if (!file.originFileObj) {
                throw new Error('文件对象不存在')
            }

            // 使用 FileReader 读取文件内容
            const reader = new FileReader()
            const content = await new Promise<string>((resolve, reject) => {
                reader.onload = (e) => {
                    resolve(e.target?.result as string)
                }
                reader.onerror = () => {
                    reject(new Error('文件读取失败'))
                }
                reader.readAsText(file.originFileObj as Blob)
            })

            if (!content) {
                throw new Error('文件内容为空')
            }

            const json = JSON.parse(content)
            await handleUpload({
                openapi: json,
            })

            handleCancel()
            onOk?.()
        } catch (err) {
            if (err instanceof Error) {
                messageApi.error(err.message)
            } else {
                messageApi.error('文件解析失败')
            }
        }
    }

    return (
        <Modal
            open={isModalOpen}
            onCancel={handleCancel}
            onOk={handleOk}
            width="45vw"
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={loading}>取消</Button>,
                <Button key="ok" type="primary" onClick={handleOk} disabled={loading || !fileList.length} loading={loading}>
                    导入
                </Button>,
            ]}
        >
            {contextHolder}
            <div className="pt-10 pb-2">
                <Upload.Dragger
                    accept=".json"
                    maxCount={1}
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onRemove={() => setFileList([])}
                    disabled={loading}
                >
                    <p className="ant-upload-drag-icon pt-2">
                        <Button type="primary">选择文件</Button>
                    </p>
                    <p className="text-sm text-gray-400">点击或拖拽文件到此处上传</p>
                </Upload.Dragger>

                <div className='pt-4 pb-2'>
                    <ul className='list-disc pl-4 text-gray-400 text-sm'>
                        <li>
                            目前仅支持 <a href='https://www.openapis.org/' target="_blank" rel="noreferrer">OpenAPI JSON</a> 格式文件，<a href='https://swagger.io/' target="_blank" rel="noreferrer">Swagger</a>、<a href="https://apifox.com/" target="_blank" rel="noreferrer">Apifox</a> 等 API 管理工具均支持导出 OpenAPI JSON 格式文件；
                        </li>
                        <li>
                            导入后，imock 将根据接口 schema 生成更智能的 mock 数据；
                        </li>
                        <li>
                            你可以重复导入，imock 会将接口 schema 更新为最新导入的版本；
                        </li>
                    </ul>
                </div>
            </div>
        </Modal>
    )
}

export default OpenapiModal
