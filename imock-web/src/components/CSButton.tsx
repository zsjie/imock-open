import { CustomerServiceOutlined } from '@ant-design/icons'
import { FloatButton } from 'antd'

import CSQrcode from './CSQrcode'

const CSButton = () => {
    return <FloatButton
        shape="circle"
        icon={<CustomerServiceOutlined />}
        tooltip={<div>
            <CSQrcode titleClassName='!text-sm' qrcodeClassName='!w-24 !h-24 !mb-2' subTitleClassName='!text-white !text-xs' />
        </div>}
    />
}

export default CSButton
