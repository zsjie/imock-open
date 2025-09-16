import './index.css'

import { loader } from '@monaco-editor/react'
import { App, ConfigProvider } from 'antd'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom'

import { router } from '~/routes'

loader.config({
    paths: {
        // vs: 'https://cdn.staticfile.net/monaco-editor/0.43.0/min/vs',
        vs: 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-3-M/monaco-editor/0.32.1/min/vs'
    },
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
    <React.StrictMode>
        <ConfigProvider>
            <App>
                <RouterProvider router={createBrowserRouter(router)} />
            </App>
        </ConfigProvider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

document.getElementById('loading')?.remove()
