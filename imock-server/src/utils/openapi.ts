import { OpenAPIV3 } from 'openapi-types'

// 辅助函数：获取响应示例
export function getResponseExample(response?: OpenAPIV3.ResponseObject): unknown {
    if (!response?.content?.['application/json']) {
        return {}
    }

    const jsonContent = response.content['application/json']
    
    // 优先使用示例
    if (jsonContent.example) {
        return jsonContent.example
    }

    // 其次使用 examples 中的第一个
    if (jsonContent.examples) {
        const firstExample = Object.values(jsonContent.examples)[0]
        if (firstExample && 'value' in firstExample) {
            return firstExample.value
        }
    }

    // 最后使用空对象
    return {}
}