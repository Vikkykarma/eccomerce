import { Link } from 'react-router-dom';

export const categoryOptions = ['Apparel', 'Home', 'Accessories', 'Stationery', 'Travel'];

export default function CategoryBar() {
    return (
        <div className='category-bar'>
            <div className='category-bar-inner'>
                {categoryOptions.map((category) => (
                    <Link key={category} className='category-bar-link' to={`/shop/category/${encodeURIComponent(category)}`}>
                        {category}
                    </Link>
                ))}
            </div>
        </div>
    );
}
