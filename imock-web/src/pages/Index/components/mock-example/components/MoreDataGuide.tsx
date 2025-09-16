import { Button, Typography } from 'antd'

import { useUserStore } from '~/store'

const MoreDataGuide = () => {
    const { userInfo } = useUserStore()

    return (
        <div className="text-left">
            <Typography.Paragraph>
        你可以发送任意请求到 imock，imock
        会根据请求信息，返回高质量的随机数据。你只需：
            </Typography.Paragraph>
            <ul>
                <li>
                    <Typography.Text>
            1. 将请求地址设置为 <code>https://use.imock.pro</code> + 你的请求路径；
                    </Typography.Text>
                </li>
                {userInfo?.userId ? (
                    <li className="pt-1">
                        <Typography.Text>
              2. 在请求中添加 <code>x-imock-id: {userInfo.userId}</code> 请求头。
                        </Typography.Text>
                    </li>
                ) : (
                    <li className="pt-1">
                        <Typography.Text>
              2. 在请求中添加 <code>x-imock-id</code> 请求头，值为你专属的 imock
              id。
                        </Typography.Text>
                        <Button type="link" size="small" onClick={() => {
                            window.location.href = '/login'
                        }}>
              马上获取专属 imock id 🚀
                        </Button>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default MoreDataGuide
