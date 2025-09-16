export function getMethodColor(method: string) {
    switch (method.toUpperCase()) {
    case 'GET':
        return '#52c41a'
    case 'POST':
        return '#1890ff'
    case 'DELETE':
        return '#f5222d'
    default:
        return '#faad14'
    }
}