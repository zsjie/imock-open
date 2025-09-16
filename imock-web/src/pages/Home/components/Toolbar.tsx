import { CopyOutlined, LinkOutlined, QrcodeOutlined, StopOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Select, Tooltip } from 'antd'
import { message } from 'antd'
import copy from 'copy-to-clipboard'
import { QRCodeCanvas } from 'qrcode.react'
import { FC, useEffect,useState } from 'react'

import EnvTag from '~/components/EnvTag'
import OpenapiIcon from '~/components/Icon/Openapi'
import { LOGO_ICON, MockEnv } from '~/lib/constants'
import { listMockUrls,switchMockEnv } from '~/services'
import { UserInfo } from '~/store'

import MockUrlModal from './MockUrlModal'
import OpenapiModal from './OpenapiModal'

interface ToolbarProps {
    userInfo?: UserInfo
    clearLogs: () => void
}

const Toolbar: FC<ToolbarProps> = ({
    userInfo, 
    clearLogs
}) => {
    const [messageApi, contextHolder] = message.useMessage()
    const [mockUrlModalVisible, setMockUrlModalVisible] = useState(false)
    const [openapiModalVisible, setOpenapiModalVisible] = useState(false)
    const [environment, setEnvironment] = useState<MockEnv>(MockEnv.none)
    const [mockUrls, setMockUrls] = useState<Record<string, boolean>>({})

    const { run: switchMockEnvAsync, loading: switchMockEnvLoading } = useRequest(switchMockEnv, {
        manual: true
    })

    const { runAsync: fetchMockUrls } = useRequest(listMockUrls, {
        manual: true,
        onSuccess: (res) => {
            const urlMap: Record<string, boolean> = {}
            res.urls.forEach(({ env, url }) => {
                urlMap[env] = !!url
            })
            setMockUrls(urlMap)

            // Find the running environment and update environment state
            const runningEnv = res.urls.find(({ running }) => running)
            if (runningEnv) {
                setEnvironment(runningEnv.env as MockEnv)
            } else {
                setEnvironment(MockEnv.none)
            }
        }
    })

    useEffect(() => {
        fetchMockUrls()
    }, [])

    const onEnvironmentChange = async (value: MockEnv) => {
        await switchMockEnvAsync(value)
        setEnvironment(value)
    }

    const showMockUrlModal = () => {
        setMockUrlModalVisible(true)
    }

    const showOpenapiModal = () => {
        setOpenapiModalVisible(true)
    }

    const onMockUrlModalOk = async () => {
        setMockUrlModalVisible(false)
        await fetchMockUrls()
    }

    const onMockUrlModalCancel = () => {
        setMockUrlModalVisible(false)
    }

    const environmentOptions = [
        { value: MockEnv.none, label: <EnvTag env={MockEnv.none} /> },
        { value: MockEnv.dev, label: <EnvTag env={MockEnv.dev} disabled={!mockUrls['dev']} />, disabled: !mockUrls['dev'] },
        { value: MockEnv.test, label: <EnvTag env={MockEnv.test} disabled={!mockUrls['test']} />, disabled: !mockUrls['test'] },
        { value: MockEnv.pre, label: <EnvTag env={MockEnv.pre} disabled={!mockUrls['pre']} />, disabled: !mockUrls['pre'] },
        { value: MockEnv.prod, label: <EnvTag env={MockEnv.prod} disabled={!mockUrls['prod']} />, disabled: !mockUrls['prod'] }
    ]

    return (
        <>
            <div className='flex items-center justify-between h-[45px] px-3'>
                {contextHolder}
                <div className='flex items-center'>
                    <Button type='text' size='small' onClick={clearLogs}><StopOutlined className='transform scale-x-[-1]' /></Button>
                    <Tooltip
                        placement='bottom'
                        title='设置服务端地址'
                    >
                        <Button type='text' size='small' className='ml-2' onClick={showMockUrlModal}><LinkOutlined className='transform scale-x-[-1]' /></Button>
                    </Tooltip>
                    <Select
                        className='ml-2 w-28'
                        size='small'
                        labelRender={(props) => {
                            return <EnvTag env={props.value as MockEnv} />
                        }}
                        value={environment}
                        onChange={onEnvironmentChange}
                        options={environmentOptions}
                        variant="borderless"
                        suffixIcon={null}
                        disabled={switchMockEnvLoading}
                    />
                    <div className='-ml-9 flex items-center'>
                        <Tooltip
                            placement='bottom'
                            title='导入 openapi 接口描述使 ai mock 更智能'
                        >
                            <Button type='text' size='small' className='mt-[1px]' onClick={showOpenapiModal}>
                                <OpenapiIcon color='#333333' size={18} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                <div className='flex items-center'>
                    <div>
                        <Tooltip title="点击复制 imock id" placement='bottom'>
                            <Button
                                type='text'
                                size='small'
                                onClick={() => {
                                    copy(userInfo?.userId || '')
                                    messageApi.success('复制成功')
                                }}
                            >
                                <span>{`imock id: ${userInfo?.userId}`}</span>
                                <CopyOutlined />
                            </Button>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip
                            title={<>
                                <p className='text-xs text-gray-500 text-center'>用于客户端/小程序<br />扫码输入 imock id</p>
                                <div className='p-2'>
                                    <QRCodeCanvas
                                        value={userInfo?.userId || ''}
                                        imageSettings={{
                                            src: LOGO_ICON,
                                            width: 24,
                                            height: 24,
                                            opacity: 1,
                                            excavate: true,
                                        }}
                                    />
                                </div>
                            </>}
                            placement='bottom'
                            color='#ffffff'
                        >
                            <Button
                                type='text'
                                size='small'
                            >
                                <QrcodeOutlined />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <MockUrlModal
                isModalOpen={mockUrlModalVisible}
                onOk={onMockUrlModalOk}
                onCancel={onMockUrlModalCancel}
            />
            <OpenapiModal
                isModalOpen={openapiModalVisible}
                onOk={() => setOpenapiModalVisible(false)}
                onCancel={() => setOpenapiModalVisible(false)}
            />
        </>
    )
}

export default Toolbar
