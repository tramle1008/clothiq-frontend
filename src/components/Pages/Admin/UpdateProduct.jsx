import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // ✅ lấy id từ url
import InputField from "../../InputField";
import { fetchCategories, fetchProduct } from "../../../store/actions";
import AdminSidebar from "./AdminSidebar";
import api from "../../../api/api";

const UpdateProduct = () => {
    const {
        register,
        handleSubmit,
        setValue, //  set giá trị khi fetch sản phẩm
        formState: { errors },
        reset,
    } = useForm();
    const dispatch = useDispatch();
    const { productId } = useParams(); // ✅ Lấy productId từ URL

    const categories = useSelector((state) => state.products.categories);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [imageFile, setImageFile] = useState(null);


    useEffect(() => {
        dispatch(fetchCategories("pageNumber=0&pageSize=1000"));

        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                const product = response.data;

                setValue("productName", product.productName);
                setValue("description", product.description);
                setValue("quantity", product.quantity);
                setValue("price", product.price);
                setValue("discount", product.discount);
                setSelectedCategoryId(product.category?.categoryID || "");
            } catch (err) {
                toast.error("Không thể tải dữ liệu sản phẩm.");
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [dispatch, productId, setValue]);

    const onSubmit = async (data) => {
        try {
            const authData = localStorage.getItem("auth");
            const { jwtToken } = JSON.parse(authData);

            const response = await api.put(
                `/admin/products/${productId}`,
                {
                    productName: data.productName,
                    description: data.description,
                    quantity: parseInt(data.quantity),
                    price: parseInt(data.price),
                    discount: parseInt(data.discount),
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success("Đã cập nhật sản phẩm");

            // Cập nhật ảnh nếu có
            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                await api.put(
                    `/products/${productId}/image`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                toast.success("Upload ảnh thành công!");
            }

            reset();
            setImageFile(null);
        } catch (err) {
            const msg = err?.response?.data?.message || "Lỗi cập nhật sản phẩm";
            toast.error(msg);
        }
    };

    return (
        <div>
            <AdminSidebar />
            <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow mt-12">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">Cập nhật Sản Phẩm</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <InputField
                        id="productName"
                        label="Tên sản phẩm"
                        type="text"
                        placeholder="VD: Áo hoodie"

                        register={register}
                        errors={errors}
                    />
                    <InputField
                        id="description"
                        label="Mô tả"
                        type="text"
                        placeholder="VD: Chất nỉ bông"

                        register={register}
                        errors={errors}
                    />
                    <InputField
                        id="quantity"
                        label="Số lượng"
                        type="number"
                        placeholder="VD: 50"

                        register={register}
                        errors={errors}
                    />
                    <InputField
                        id="price"
                        label="Giá"
                        type="number"
                        placeholder="VD: 350000"

                        register={register}
                        errors={errors}
                    />
                    <InputField
                        id="discount"
                        label="Giảm giá (%)"
                        type="number"
                        placeholder="VD: 10"
                        register={register}
                        min={0}
                        errors={errors}
                    />

                    {/* Upload ảnh */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-sm text-slate-800">Ảnh sản phẩm</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="border border-slate-700 p-2 rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#1F2937] hover:bg-blue-200 text-white py-2 rounded-md"
                    >
                        Cập nhật
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProduct;
