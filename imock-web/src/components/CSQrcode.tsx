import QrcodeImage from '~/assets/wechat-cs-qrcode.png'

const CSQrcode = ({
    className = '',
    qrcodeClassName = '',
    titleClassName = '',
    subTitleClassName = ''
}: {
    className?: string
    qrcodeClassName?: string
    titleClassName?: string
    subTitleClassName?: string
}) => {
    return <div className={className}>
        <div className={`text-center text-2xl font-bold mb-2 ${titleClassName}`}>在线客服</div>
        <img src={QrcodeImage} alt="微信客服二维码" className={`w-48 h-48 mx-auto mb-4 ${qrcodeClassName}`} />
        <div className={`text-center text-gray-500 ${subTitleClassName}`}>微信扫码联系</div>
    </div>
}

export default CSQrcode
