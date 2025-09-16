import http from 'node:http'

import { Server } from 'socket.io'

import createApp from './app'
import { startTasks } from './tasks'

const app = createApp()

const server = http.createServer(app.callback())
const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: '*',
    },
})

app.context.io = io

const port = process.env.SERVER_PORT || 6060
server.listen(port, () => {
    console.log(`[${new Date().toISOString()}] Server started, listening on port ${port}. Environment Variables:
RUNTIME_ENV: ${process.env.RUNTIME_ENV}
STATIC_DIR: ${process.env.STATIC_DIR}
ORIGIN: ${process.env.ORIGIN}
EMAIL_HOST: ${process.env.EMAIL_HOST}
EMAIL_PORT: ${process.env.EMAIL_PORT}
EMAIL_USER: ${process.env.EMAIL_USER}
`)
})

startTasks()
