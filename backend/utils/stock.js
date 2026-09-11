export function statusForStock(stock) {
    if (stock === 0) return 'Out of stock';
    if (stock < 10) return 'Low stock';
    return 'In stock';
}

export function serializeProduct(product) {
    return {
        id: product._id.toString(),
        name: product.name,
        category: product.category,
        description: product.description,
        image: product.image,
        images: product.images || (product.image ? [product.image] : []),
        price: product.price,
        stock: product.stock,
        sold: product.sold,
        stockStatus: statusForStock(product.stock),
    };
}
