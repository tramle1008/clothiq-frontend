import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import { getBannersApi, resolveBannerImage } from "../../api/bannerApi";

const HeroBanner = () => {
    const [banners, setBanners] = useState([]);
    useEffect(() => {
        getBannersApi("HERO").then(setBanners).catch((error) => console.error("Không thể tải banner", error));
    }, []);

    if (!banners.length) return null;
    return (
        <div className="py-2 rounded-md">
            <Swiper grabCursor autoplay={{ delay: 4000, disableOnInteraction: false }} navigation
                modules={[Pagination, Navigation, Autoplay]} pagination={{ clickable: true }} slidesPerView={1}>
                {banners.map((item) => (
                    <SwiperSlide key={item.bannerId}>
                        <div className="carousel-item rounded-md sm:h-[500px] h-96 bg-stone-800">
                            <div className="flex flex-col lg:flex-row items-center h-full">
                                <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center text-center lg:text-left lg:m-25">
                                    <h1 className="text-5xl text-white font-bold">{item.title}</h1>
                                    <p className="mt-2 text-white">{item.description}</p>
                                    <Link to={item.linkUrl || "/products"} className="mt-6 inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-stone-800 self-center lg:self-start">Khám phá</Link>
                                </div>
                                <div className="w-full lg:w-1/2 flex justify-center p-4">
                                    <img src={resolveBannerImage(item.imageUrl)} alt={item.title} className="max-h-[400px] rounded-md object-contain" />
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroBanner;
