import OpenAI from 'openai'

import { Logger } from './logger'

const logger = new Logger('qwen')

const openai = new OpenAI(
    {
        // 从环境变量读取 API Key，确保安全性
        apiKey: process.env.QWEN_API_KEY || '',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    }
)

const mockWithQwen = async (prompt: string) => {
    logger.debug('🚀 ~ mockWithAI ~ prompt:', prompt)
    const completion = await openai.chat.completions.create({
        model: 'qwen-turbo',  //模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: [
            { role: 'system', content: 'You are a seasoned backend developer with rich experience in RESTful API design and implementation.' },
            { role: 'user', content: prompt }
        ],
    })
    logger.debug('ai res:', JSON.stringify(completion))

    return completion.choices[0].message.content
}

export default mockWithQwen
