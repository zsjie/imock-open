import Editor from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'

import { RequestDetail } from '../LogItem'

interface RequestTabProps {
  requestDetail: RequestDetail;
  type: 'request' | 'response';
}

function getHeadersAndBody(detail: RequestDetail, type: 'request' | 'response') {
    if (type === 'request') {
        return {
            headers: detail.requestHeaders,
            body: detail.requestBody,
        }
    }

    return {
        headers: detail.responseHeaders,
        body: detail.responseBody,
    }
}

export default function RequestTab({ requestDetail, type }: RequestTabProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [editorHeight, setEditorHeight] = useState('75vh')
    const { body } = getHeadersAndBody(requestDetail, type)

    
    useEffect(() => {
        if (containerRef.current) {
            // 计算editor的高度
            const { height } = containerRef.current.getBoundingClientRect()
            setEditorHeight(`${height}px`)
        }
    }, [])

    return (
        requestDetail && (
            <div className='overflow-scroll h-[calc(100vh-158px)] relative' ref={containerRef}>
                <div>
                    <Editor
                        width="100%"
                        height={editorHeight}
                        defaultLanguage="json"
                        value={body ? JSON.stringify(body, null, 4) : ''}
                        options={{
                            selectOnLineNumbers: true,
                            minimap: { enabled: false },
                            readOnly: true,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>
            </div>
        )
    )
}
