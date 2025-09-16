import { forwardRef, useImperativeHandle, useState } from 'react'

import ProductExampleData from '../example-data/goods-example-data.json'

interface Product {
    description: string
    id: string
    image: string
    name: string
    price: number
    stock: number
}

// 定义 ref 暴露的方法类型
export interface ProductListRef {
    refresh: () => void
}

const ProductCard = ({ product }: { product: Product }) => {
    return (
        <div className="w-24 md:w-28 bg-white rounded-lg overflow-hidden shadow">
            {/* 商品图片 */}
            <div className="w-full aspect-square bg-gray-100">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                />
            </div>
      
            {/* 商品信息 */}
            <div className="p-4">
                <h3 className="text-xs font-normal mb-2 truncate text-left">
                    {product.name}
                </h3>
        
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline">
                        <span className="text-red-500 text-sm">¥</span>
                        <span className="text-red-500 text-lg font-bold">
                            {Math.floor(product.price)}
                        </span>
                        <span className="text-red-500 text-sm">
                            .{(product.price % 1).toFixed(2).slice(2)}
                        </span>
                    </div>
                </div>

                <div className="text-gray-400 text-xs text-left">
                        销量{product.stock}+
                </div>
            </div>
        </div>
    )
}

const ProductList = forwardRef<ProductListRef>((_props, ref) => {
    // 使用内部状态管理商品列表
    const [products, setProducts] = useState(() => getRandomProducts())

    // 从商品数据中随机选择 6 个商品
    function getRandomProducts() {
        const shuffled = [...ProductExampleData]
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)
        return shuffled
    }

    // 通过 ref 暴露 refresh 方法
    useImperativeHandle(ref, () => ({
        refresh: () => setProducts(getRandomProducts())
    }))

    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-6 justify-items-center">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
})

export default ProductList
