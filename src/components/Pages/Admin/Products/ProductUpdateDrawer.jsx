import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiImage, FiPackage, FiSave } from "react-icons/fi";

import api from "../../../../api/api";
import { fetchCategories } from "../../../../store/actions";
import { getAuthToken } from "../../../../utils/auth";
import AdminDrawer from "../AdminDrawer";

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 3,
        backgroundColor: "#f8fafc",
        transition: "all 0.2s ease",
        "& fieldset": {
            borderColor: "#cbd5e1",
        },
        "&:hover fieldset": {
            borderColor: "#94a3b8",
        },
        "&.Mui-focused": {
            backgroundColor: "#ffffff",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#64748b",
            boxShadow: "0 0 0 3px rgba(100, 116, 139, 0.10)",
        },
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#475569",
    },
};

const sectionSx = {
    p: { xs: 2, md: 2.5 },
    borderRadius: 4,
    border: "1px solid #dbe3ec",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
};

const ProductUpdateDrawer = ({ open, productId, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.products.categories || []);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            productCode: "",
            productName: "",
            description: "",
            quantity: "",
            costPrice: "",
            salePrice: "",
        },
    });

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);

    const previewUrl = useMemo(() => {
        if (!imageFile) {
            return imagePreviewUrl;
        }

        return URL.createObjectURL(imageFile);
    }, [imageFile, imagePreviewUrl]);

    useEffect(() => {
        if (!previewUrl || !imageFile) {
            return undefined;
        }

        return () => URL.revokeObjectURL(previewUrl);
    }, [imageFile, previewUrl]);

    useEffect(() => {
        if (!open) {
            return;
        }

        dispatch(fetchCategories("pageNumber=0&pageSize=1000"));
    }, [dispatch, open]);

    useEffect(() => {
        if (!open || !productId) {
            return;
        }

        let isMounted = true;

        const fetchProductDetail = async () => {
            try {
                setIsLoadingProduct(true);
                const response = await api.get(`/products/${productId}`);
                const product = response.data;

                if (!isMounted) {
                    return;
                }

                reset({
                    productCode: product.productCode || "",
                    productName: product.productName || "",
                    description: product.description || "",
                    quantity: product.quantity ?? "",
                    costPrice: product.costPrice ?? "",
                    salePrice: product.salePrice ?? "",
                });
                setSelectedCategoryId(String(product.categoryId || ""));
                setImageFile(null);
                setImagePreviewUrl(product.image || "");
            } catch {
                toast.error("Không thể lấy thông tin sản phẩm. Vui lòng thử lại sau.");
                onClose?.();
            } finally {
                if (isMounted) {
                    setIsLoadingProduct(false);
                }
            }
        };

        fetchProductDetail();

        return () => {
            isMounted = false;
        };
    }, [open, productId, reset, onClose]);

    const handleDrawerClose = () => {
        if (isSubmitting) {
            return;
        }

        reset({
            productCode: "",
            productName: "",
            description: "",
            quantity: "",
            costPrice: "",
            salePrice: "",
        });
        setSelectedCategoryId("");
        setImageFile(null);
        setImagePreviewUrl("");
        onClose?.();
    };

    const onSubmit = async (data) => {
        try {
            const token = getAuthToken();

            if (!token) {
                toast.error("Vui lòng đăng nhập lại.");
                return;
            }

            if (!selectedCategoryId) {
                toast.error("Vui lòng chọn danh mục.");
                return;
            }

            await api.put(
                `/admin/products/${productId}`,
                {
                    productName: data.productName.trim(),
                    description: data.description.trim(),
                    quantity: Number(data.quantity),
                    costPrice: Number(data.costPrice),
                    salePrice: Number(data.salePrice),
                    categoryId: Number(selectedCategoryId),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);
                await api.put(`/products/${productId}/image`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            toast.success("Đã cập nhật sản phẩm thành công.");
            onSuccess?.();
            handleDrawerClose();
        } catch (error) {
            const message = error?.response?.data?.message || "Không thể cập nhật sản phẩm. Vui lòng thử lại sau.";
            toast.error(message);
        }
    };

    const footer = (
        <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} justifyContent="flex-end">
            <Button
                type="button"
                variant="outlined"
                disabled={isSubmitting}
                onClick={handleDrawerClose}
                sx={{
                    minWidth: 120,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: "#cbd5e1",
                    color: "#334155",
                }}
            >
                Hủy
            </Button>
            <Button
                type="submit"
                form="product-update-form"
                variant="contained"
                startIcon={isSubmitting ? null : <FiSave />}
                disabled={isSubmitting || isLoadingProduct}
                sx={{
                    minWidth: 160,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#0f172a",
                    boxShadow: "none",
                    "&:hover": {
                        backgroundColor: "#1e293b",
                        boxShadow: "none",
                    },
                }}
            >
                {isSubmitting ? "Đang lưu..." : "Cập nhật"}
            </Button>
        </Stack>
    );

    return (
        <AdminDrawer
            open={open}
            onClose={handleDrawerClose}
            title="Cập nhật sản phẩm"
            footer={footer}
        >
            {isLoadingProduct ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
                    <CircularProgress size={28} sx={{ color: "#0f172a" }} />
                </Stack>
            ) : (
                <Box
                    component="form"
                    id="product-update-form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                    <Paper elevation={0} sx={sectionSx}>
                        <Stack spacing={2}>
                            <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 800, color: "#0f172a" }}>
                                <FiPackage />
                                Thông tin sản phẩm
                            </Typography>

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField
                                    label="Mã sản phẩm"
                                    fullWidth
                                    error={Boolean(errors.productCode)}
                                    helperText={errors.productCode?.message}
                                    {...register("productCode")}
                                    sx={fieldSx}
                                />
                                <FormControl fullWidth sx={fieldSx}>
                                    <InputLabel id="product-category-select-label">Danh mục</InputLabel>
                                    <Select
                                        labelId="product-category-select-label"
                                        label="Danh mục"
                                        value={selectedCategoryId}
                                        onChange={(event) => setSelectedCategoryId(event.target.value)}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.categoryID} value={String(category.categoryID)}>
                                                {category.categoryName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <TextField
                                label="Tên sản phẩm"
                                fullWidth
                                error={Boolean(errors.productName)}
                                helperText={errors.productName?.message}
                                {...register("productName", {
                                    required: "Vui lòng nhập tên sản phẩm.",
                                })}
                                sx={fieldSx}
                            />

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField
                                    label="Số lượng"
                                    type="number"
                                    error={Boolean(errors.quantity)}
                                    helperText={errors.quantity?.message}
                                    {...register("quantity", {
                                        required: "Vui lòng nhập số lượng.",
                                        min: { value: 0, message: "Số lượng phải lớn hơn hoặc bằng 0." },
                                    })}
                                    sx={{
                                        ...fieldSx,
                                        width: { xs: "100%", md: 220 },
                                    }}
                                />
                            </Stack>

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <TextField
                                    label="Giá gốc"
                                    type="number"
                                    fullWidth
                                    error={Boolean(errors.costPrice)}
                                    helperText={errors.costPrice?.message}
                                    {...register("costPrice", {
                                        required: "Vui lòng nhập giá gốc.",
                                        min: { value: 0, message: "Giá gốc phải lớn hơn hoặc bằng 0." },
                                    })}
                                    sx={fieldSx}
                                />
                                <TextField
                                    label="Giá bán"
                                    type="number"
                                    fullWidth
                                    error={Boolean(errors.salePrice)}
                                    helperText={errors.salePrice?.message}
                                    {...register("salePrice", {
                                        required: "Vui lòng nhập giá bán.",
                                        min: { value: 0, message: "Giá bán phải lớn hơn hoặc bằng 0." },
                                    })}
                                    sx={fieldSx}
                                />
                            </Stack>

                            <TextField
                                label="Mô tả"
                                fullWidth
                                multiline
                                minRows={3}
                                error={Boolean(errors.description)}
                                helperText={errors.description?.message}
                                {...register("description", {
                                    required: "Vui lòng nhập mô tả.",
                                })}
                                sx={fieldSx}
                            />
                        </Stack>
                    </Paper>

                    <Paper elevation={0} sx={sectionSx}>
                        <Stack spacing={2}>
                            <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 800, color: "#0f172a" }}>
                                <FiImage />
                                Hình ảnh sản phẩm
                            </Typography>

                            {previewUrl ? (
                                <Box
                                    component="img"
                                    src={previewUrl}
                                    alt="Product preview"
                                    sx={{
                                        width: "100%",
                                        maxWidth: 220,
                                        height: 220,
                                        objectFit: "cover",
                                        borderRadius: 3,
                                        border: "1px solid #dbe3ec",
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: "100%",
                                        maxWidth: 220,
                                        height: 220,
                                        display: "grid",
                                        placeItems: "center",
                                        borderRadius: 3,
                                        border: "1px dashed #cbd5e1",
                                        color: "#94a3b8",
                                        backgroundColor: "#f8fafc",
                                    }}
                                >
                                    Chưa có ảnh
                                </Box>
                            )}

                            <Button component="label" variant="outlined" sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 999 }}>
                                Chọn ảnh mới
                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                                />
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            )}
        </AdminDrawer>
    );
};

export default ProductUpdateDrawer;
