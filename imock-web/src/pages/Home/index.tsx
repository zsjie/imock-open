import Split from '@uiw/react-split'
import { CSSProperties, useEffect, useState } from 'react'

import Layout from '~/components/Layout'
import getSocketClient from '~/lib/socket'
import { useUserStore } from '~/store'

import { LogItem } from './components/LogItem'
import RequestInfo from './components/RequestInfo'
import Toolbar from './components/Toolbar'

export default function RequestLog() {
    const [logs, setLogs] = useState<any[]>([])
    const [selectedLog, setSelectedLog] = useState<any>(null)
    const [activeIndex, setActiveIndex] = useState(-1)
    const { userInfo } = useUserStore()

    useEffect(() => {
        if (!userInfo) {
            return
        }

        const socket = getSocketClient()
        const eventName = `request:${userInfo.userId}`
        const onRequest = (data: any) => {
            setLogs(prev => [...prev, data])
        }
        socket.on(eventName, onRequest)

        return () => {
            socket.off(eventName, onRequest)
        }
    }, [userInfo])

    const clearLogs = () => {
        setLogs([])
        setSelectedLog(null)
        setActiveIndex(-1)
    }

    const onSwitchAIMock = (data: { url: string, method: string, aiMockRunning: boolean }) => {
        const dataPath = new URL(data.url, window.location.origin).pathname

        const newLogs = logs.map(log => {
            const logPath = new URL(log.url, window.location.origin).pathname
            return {
                ...log,
                aiMockRunning: log.method === data.method && logPath === dataPath
                    ? data.aiMockRunning
                    : log.aiMockRunning,
            }
        })

        setLogs([...newLogs])
    }

    return (
        <Layout>
            <div>
                <Split
                    lineBar
                    className='h-[calc(100vh-57px)]'
                    style={{
                        '--w-split-line-bar-background': '#e5e7eb',
                        '--w-split-line-bar-active-background': '#4075F7',
                    } as CSSProperties}
                >
                    <div className='w-1/2'>
                        <div
                            className='relative bg-white h-[calc(100vh-57px)]'
                        >
                            <div className='sticky top-0 z-10 bg-white border-b border-slate-50'>
                                <Toolbar userInfo={userInfo} clearLogs={clearLogs} />
                            </div>
                            <div className="h-[calc(100vh-110px)] overflow-scroll">
                                {logs.map((requestData, index) => (
                                    <LogItem
                                        key={`${requestData.url}-${index.toString()}`}
                                        log={requestData}
                                        active={activeIndex === index}
                                        onClick={() => {
                                            setActiveIndex(index)
                                            setSelectedLog(requestData)
                                        }}
                                        onSwitchAIMock={onSwitchAIMock}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='flex-1 bg-white h-[calc(100vh - 57px)] overflow-x-hidden'>
                        <RequestInfo index={activeIndex} detail={selectedLog} />
                    </div>
                </Split>
            </div>
        </Layout>
    )
}
