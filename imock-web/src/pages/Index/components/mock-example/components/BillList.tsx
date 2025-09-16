import dayjs from 'dayjs'
import { forwardRef, useImperativeHandle, useState } from 'react'

import billExampleData from '../example-data/bill-example-data.json'

interface Bill {
    id: string
    billNumber: string
    amount: number
    status: string
    image: string
    createdAt: string
    updatedAt: string
    userId: string
    currency?: string
}

export interface BillListRef {
    refresh: () => void
}

const BillCard = ({ bill }: { bill: Bill }) => {
    return (
        <div className="w-full bg-white rounded-lg overflow-hidden shadow p-4">
            <div className="flex items-start gap-3">
                {/* 左侧图片 */}
                <div className="md:w-16 md:h-16 w-12 h-12 bg-gray-100 rounded">
                    <img 
                        src={bill.image} 
                        alt={bill.billNumber} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 右侧信息 */}
                <div className="flex-1">
                    {/* 账单号和状态 */}
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 truncate">
                            {bill.billNumber}
                        </span>
                        <span className={`text-xs px-1 md:px-2 py-1 rounded ${
                            bill.status === 'PAID' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-orange-100 text-orange-600'
                        }`}>
                            {bill.status === 'PAID' ? '已支付' : '待支付'}
                        </span>
                    </div>

                    {/* 金额和时间 */}
                    <div className="flex justify-between items-end">
                        <div className="flex items-baseline">
                            <span className="text-sm">¥</span>
                            <span className="text-lg font-bold">
                                {Math.floor(bill.amount)}
                            </span>
                            <span className="text-sm">
                                .{(bill.amount % 1).toFixed(2).slice(2)}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">
                            {dayjs(bill.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getRandomBills() {
    return [...billExampleData]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
}

const BillList = forwardRef<BillListRef>((_props, ref) => {
    const [bills, setBills] = useState(() => getRandomBills())

    useImperativeHandle(ref, () => ({
        refresh: () => setBills(getRandomBills())
    }))

    return (
        <div className="container mx-auto md:px-1">
            <div className="space-y-4">
                {bills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} />
                ))}
            </div>
        </div>
    )
})

export default BillList 