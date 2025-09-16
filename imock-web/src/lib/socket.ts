import { io, Socket } from 'socket.io-client'

const URL = process.env.SOCKET_URL || window.location.origin

const socket: Socket | null = null

function getSocketClient() {
    if (!socket) {
        const socket = io(URL)
        return socket
    }

    return socket
}

export default getSocketClient

