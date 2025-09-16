import dayjs from 'dayjs'
import { forwardRef, useImperativeHandle, useState } from 'react'

import todoExampleData from '../example-data/todo-example-data.json'

interface Todo {
    id: string
    title: string
    description: string
    priority: string
    status: string
    image: string
    createdTime: string
    userId: string
    userName?: string
}

export interface TodoListRef {
    refresh: () => void
}

const TodoCard = ({ todo }: { todo: Todo }) => {
    const getPriorityStyle = (priority: string) => {
        switch (priority) {
        case '高':
            return 'bg-red-100 text-red-600'
        case '中':
            return 'bg-blue-100 text-blue-600'
        case '低':
            return 'bg-gray-100 text-gray-600'
        default:
            return 'bg-gray-100 text-gray-600'
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
        case '已完成':
            return 'bg-green-100 text-green-600'
        case '进行中':
            return 'bg-blue-100 text-blue-600'
        case '待办':
            return 'bg-orange-100 text-orange-600'
        case '未开始':
            return 'bg-gray-100 text-gray-600'
        default:
            return 'bg-gray-100 text-gray-600'
        }
    }

    return (
        <div className="w-full bg-white rounded-lg overflow-hidden shadow">
            <div className="flex items-start gap-3 p-4">
                {/* 左侧图片 */}
                <div className="md:w-16 md:h-16 w-12 h-12 bg-gray-100 rounded">
                    <img 
                        src={todo.image} 
                        alt={todo.title} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 右侧信息 */}
                <div className="flex-1">
                    {/* 标题和状态 */}
                    <div className="flex justify-between items-start mb-2">
                        <div className='text-left'>
                            <h3 className="font-medium text-gray-900">{todo.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                                {todo.description}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityStyle(todo.priority)}`}>
                                {todo.priority}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusStyle(todo.status)}`}>
                                {todo.status}
                            </span>
                        </div>
                    </div>

                    {/* 底部信息 */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{todo.userName}</span>
                        <span>{dayjs(todo.createdTime).format('YYYY-MM-DD HH:mm')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getRandomTodos() {
    return [...todoExampleData]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
}

const TodoList = forwardRef<TodoListRef>((_props, ref) => {
    const [todos, setTodos] = useState(() => getRandomTodos())

    useImperativeHandle(ref, () => ({
        refresh: () => setTodos(getRandomTodos())
    }))

    return (
        <div className="container mx-auto md:px-1">
            <div className="space-y-4">
                {todos.map((todo) => (
                    <TodoCard key={todo.id} todo={todo} />
                ))}
            </div>
        </div>
    )
})

export default TodoList 