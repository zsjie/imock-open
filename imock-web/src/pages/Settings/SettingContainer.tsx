import { Outlet } from 'react-router-dom'

import Layout from '~/components/Layout'
import useLayoutInfo from '~/store/useLayoutInfo'

import SettingSidebar from './SettingSideBar'

const SettingContainer = () => {
    const { headerHeight } = useLayoutInfo()
    return (
        <Layout>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
                <SettingSidebar />
                <div className="flex-1 max-w-[1025px] min-w-[705px] pl-16" style={{
                    minHeight: `calc(100vh - ${headerHeight}px)`,
                }}>
                    <Outlet />
                </div>
            </div>
        </Layout>
    )
}

export default SettingContainer
