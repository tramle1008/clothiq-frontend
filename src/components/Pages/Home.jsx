import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProduct } from "../../store/actions";
import ProductCard from "./Product/ProductCard";
import HeroBanner from "./HeroBanner";
import { getBannersApi, resolveBannerImage } from "../../api/bannerApi";

const Home = () => {
    const dispatch = useDispatch();
    const { products } = useSelector((state) => state.products);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    useEffect(() => { dispatch(fetchProduct()); }, [dispatch]);
    useEffect(() => {
        getBannersApi("FEATURED_CATEGORY").then(setFeaturedCategories)
            .catch((error) => console.error("Không thể tải danh mục nổi bật", error));
    }, []);
    const featuredProducts = products.slice(2, 6);

    return <>
        <HeroBanner />
        <section className="bg-[#f2f2f2] pt-5 pb-10 px-4 sm:px-8 lg:px-14">
            <div className="mb-20">
                <h2 className="text-2xl font-bold mb-8 text-center">Danh mục nổi bật</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {featuredCategories.map((item) => <Link key={item.bannerId} to={item.linkUrl || "/products"}>
                        <div className="bg-white p-4 rounded-lg shadow text-center cursor-pointer hover:shadow-lg transition">
                            <img src={resolveBannerImage(item.imageUrl)} alt={item.description} className="w-full h-40 object-cover rounded-md mb-2" />
                            <p className="font-semibold">{item.title}</p>
                        </div>
                    </Link>)}
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-8 text-center">Sản phẩm nổi bật</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {featuredProducts.map((item) => <ProductCard key={item.productId} {...item} />)}
                </div>
                <div className="text-center mt-10"><Link to="/products" className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800">Xem tất cả sản phẩm</Link></div>
            </div>
        </section>
    </>;
};

export default Home;
