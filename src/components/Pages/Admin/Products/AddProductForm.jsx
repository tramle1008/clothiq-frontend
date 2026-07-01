import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Button,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiImage, FiPackage, FiTag, FiUploadCloud, FiX } from "react-icons/fi";

import { addProductApi } from "../../../../api/inventoryApi";
import { fetchCategories } from "../../../../store/actions";
import { getAuthToken } from "../../../../utils/auth";

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

const sectionCardSx = {
    borderRadius: 4,
    border: "1px solid #dbe3ec",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
};

const sectionTitleSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "1.05rem",
};

const actionButtonSx = {
    minWidth: 150,
    borderRadius: 999,
    px: 3,
    py: 1.35,
    textTransform: "none",
    fontWeight: 700,
};

const compactSectionHeaderSx = {
    p: { xs: 2, md: 2.25 },
    "& .section-title": {
        fontSize: "1rem",
    },
    "& .section-description": {
        mt: 0.5,
        fontSize: "0.88rem",
    },
};

const SectionHeader = ({ icon, title, description, sx }) => (
    <Box sx={{ p: { xs: 2.5, md: 3 }, ...sx }}>
        <Typography className="section-title" sx={sectionTitleSx}>
            {icon}
            {title}
        </Typography>
        {description ? (
            <Typography className="section-description" sx={{ mt: 0.75, color: "#64748b", fontSize: "0.92rem" }}>
                {description}
            </Typography>
        ) : null}
    </Box>
);

const AddProductForm = ({ onClose, onSuccess }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        defaultValues: {
            productCode: "",
            productName: "",
            description: "",
            quantity: "",
            salePrice: "",
            costPrice: "",
            discount: 0,
        },
    });

    const dispatch = useDispatch();
    const categories = useSelector((state) => state.products.categories);

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const imagePreview = useMemo(() => {
        if (!imageFile) {
            return null;
        }

        return URL.createObjectURL(imageFile);
    }, [imageFile]);

    useEffect(() => {
        dispatch(fetchCategories("pageNumber=0&pageSize=1000"));
    }, [dispatch]);

    useEffect(() => {
        if (!selectedCategoryId && categories.length > 0) {
            setSelectedCategoryId(String(categories[0].categoryID));
        }
    }, [categories, selectedCategoryId]);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (event) => {
        const nextFile = event.target.files?.[0] || null;
        setImageFile(nextFile);
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

            if (!imageFile) {
                toast.error("Vui lòng chọn ảnh sản phẩm.");
                return;
            }

            await addProductApi({
                categoryId: selectedCategoryId,
                product: {
                    productCode: data.productCode.trim(),
                    productName: data.productName.trim(),
                    description: data.description.trim(),
                    quantity: Number(data.quantity),
                    salePrice: Number(data.salePrice),
                    costPrice: data.costPrice === "" ? null : Number(data.costPrice),
                    discount: Number(data.discount),
                    status: "ACTIVE",
                },
                imageFile,
                token,
            });

            toast.success("Đã thêm sản phẩm thành công.");
            reset();
            setImageFile(null);
            setSelectedCategoryId(categories[0]?.categoryID ? String(categories[0].categoryID) : "");
            onSuccess?.();
            onClose?.();
        } catch (err) {
            const msg = err?.response?.data?.message || "Lỗi thêm sản phẩm";
            toast.error(msg);
            console.error(err);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                maxWidth: 1480,
                mt: { xs: 3, md: 4 },
                mx: "auto",
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid #dbe3ec",
                background:
                    "radial-gradient(circle at top left, rgba(191, 219, 254, 0.32), transparent 28%), #f8fafc",
                boxShadow: "0 28px 80px rgba(15, 23, 42, 0.12)",
            }}
        >
            <Box
                sx={{
                    px: { xs: 3, md: 4 },
                    py: { xs: 2.25, md: 2.75 },
                    background: "linear-gradient(135deg, #f8fbff 0%, #e2e8f0 100%)",
                    borderBottom: "1px solid #dbe3ec",
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Box>
                        <Typography
                            sx={{
                                fontSize: { xs: "1.4rem", md: "1.9rem" },
                                lineHeight: 1,
                                fontWeight: 800,
                                color: "#0f172a",
                                fontFamily: "'Segoe UI', sans-serif",
                            }}
                        >
                            Sản phẩm mới
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: "#475569",
                            bgcolor: "rgba(255,255,255,0.8)",
                            border: "1px solid #dbe3ec",
                            borderRadius: 3,
                            "&:hover": {
                                bgcolor: "#fff",
                            },
                        }}
                    >
                        <FiX />
                    </IconButton>
                </Stack>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 2, md: 2.25 } }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
                        gap: { xs: 2, md: 2.25 },
                        alignItems: "stretch",
                    }}
                >
                    <Stack spacing={{ xs: 1, md: 1.5 }} sx={{ height: "100%" }}>
                        <Paper elevation={0} sx={sectionCardSx}>
                            <SectionHeader
                                icon={<FiPackage size={18} />}
                                title="Thông tin sản phẩm"
                                sx={compactSectionHeaderSx}
                            />
                            <Divider />
                            <Box sx={{ p: { xs: 2, md: 2.25 }, flex: 1 }}>
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="Tên sản phẩm"
                                        placeholder="Áo sơ mi linen tay dài"
                                        error={!!errors.productName}
                                        helperText={errors.productName?.message}
                                        sx={fieldSx}
                                        {...register("productName", {
                                            required: "Vui lòng nhập tên sản phẩm",
                                        })}
                                    />

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                            gap: 2,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Ma san pham"
                                            placeholder="CLQ-SHIRT-001"
                                            error={!!errors.productCode}
                                            helperText={errors.productCode?.message}
                                            sx={fieldSx}
                                            {...register("productCode", {
                                                required: "Vui lòng nhập mã sản phẩm",
                                            })}
                                        />

                                        <FormControl fullWidth sx={fieldSx}>
                                            <InputLabel id="category-select-label">Danh muc</InputLabel>
                                            <Select
                                                labelId="category-select-label"
                                                value={selectedCategoryId}
                                                label="Danh muc"
                                                onChange={(event) => setSelectedCategoryId(event.target.value)}
                                            >
                                                {categories.map((cat) => (
                                                    <MenuItem key={cat.categoryID} value={String(cat.categoryID)}>
                                                        {cat.categoryName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={5}
                                        label="Mo ta"
                                        placeholder="Mo ta chat lieu, dang ve, diem noi bat va cach su dung san pham."
                                        error={!!errors.description}
                                        helperText={errors.description?.message}
                                        sx={fieldSx}
                                        {...register("description", {
                                            required: "Vui lòng nhập mô tả",
                                        })}
                                    />
                                </Stack>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ ...sectionCardSx, flex: 1 }}>
                            <SectionHeader icon={<FiTag size={18} />} title="Ton kho va gia ban" />
                            <Divider />
                            <Box sx={{ p: { xs: 2, md: 2.25 }, flex: 1, display: "flex", alignItems: "center" }}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                        gap: 2,
                                    }}
                                >


                                    <TextField
                                        fullWidth
                                        label="Sale price"
                                        type="number"
                                        placeholder="199000"
                                        error={!!errors.salePrice}
                                        helperText={errors.salePrice?.message}
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">VND</InputAdornment>,
                                        }}
                                        {...register("salePrice", {
                                            required: "Vui lòng nhập giá bán",
                                            min: {
                                                value: 1,
                                                message: "Giá phải lớn hơn 0",
                                            },
                                        })}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Cost price"
                                        type="number"
                                        placeholder="120000"
                                        error={!!errors.costPrice}
                                        helperText={errors.costPrice?.message}
                                        sx={fieldSx}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">VND</InputAdornment>,
                                        }}
                                        {...register("costPrice", {
                                            validate: (value) =>
                                                value === "" || Number(value) >= 0 || "Giá vốn không được âm",
                                        })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Số lượng"
                                        type="number"
                                        placeholder="20"
                                        error={!!errors.quantity}
                                        helperText={errors.quantity?.message}
                                        sx={fieldSx}
                                        {...register("quantity", {
                                            required: "Vui lòng nhập số lượng",
                                            min: {
                                                value: 1,
                                                message: "Số lượng phải lớn hơn 0",
                                            },
                                        })}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Discount"
                                        type="number"
                                        placeholder="10"
                                        error={!!errors.discount}
                                        helperText={errors.discount?.message}
                                        sx={fieldSx}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                        }}
                                        {...register("discount", {
                                            required: "Vui lòng nhập mức khuyến mãi",
                                            min: {
                                                value: 0,
                                                message: "Mức khuyến mãi không được âm",
                                            },
                                        })}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    </Stack>

                    <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ height: "100%" }}>
                        <Paper elevation={0} sx={{ ...sectionCardSx, flex: 1 }}>
                            <SectionHeader
                                icon={<FiImage size={18} />}
                                title="Ảnh sản phẩm"
                                description="Chọn ảnh rõ, để nhìn."
                            />
                            <Divider />
                            <Box sx={{ p: { xs: 2, md: 2.25 }, flex: 1 }}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "1.1fr 0.9fr" },
                                        gap: 2,
                                        alignItems: "stretch",
                                        minHeight: { xs: 240, md: 280 },
                                    }}
                                >
                                    <Box
                                        component="label"
                                        sx={{
                                            minHeight: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 1.25,
                                            borderRadius: 4,
                                            border: "1.5px dashed #94a3b8",
                                            background:
                                                "linear-gradient(180deg, rgba(241, 245, 249, 0.96) 0%, rgba(255, 255, 255, 1) 100%)",
                                            color: "#475569",
                                            cursor: "pointer",
                                            textAlign: "center",
                                            px: 2.5,
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                borderColor: "#64748b",
                                                background:
                                                    "linear-gradient(180deg, rgba(226, 232, 240, 0.95) 0%, rgba(255, 255, 255, 1) 100%)",
                                            },
                                        }}
                                    >
                                        <FiUploadCloud size={28} />
                                        <Typography sx={{ fontWeight: 700 }}>Click de tai anh len</Typography>
                                        <Typography sx={{ fontSize: "0.92rem", color: "#64748b" }}>
                                            JPG, PNG hoac WEBP. Kich thuoc toi da 5MB.
                                        </Typography>
                                        <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                                    </Box>

                                    <Box
                                        sx={{
                                            minHeight: "100%",
                                            borderRadius: 4,
                                            border: "1px solid #dbe3ec",
                                            backgroundColor: "#fff",
                                            overflow: "hidden",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    >
                                        {imagePreview ? (
                                            <Box
                                                component="img"
                                                src={imagePreview}
                                                alt="Preview"
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <Stack spacing={1} alignItems="center" sx={{ color: "#94a3b8", px: 2 }}>
                                                <FiImage size={30} />
                                                <Typography sx={{ fontWeight: 700 }}>Preview image</Typography>
                                                <Typography sx={{ fontSize: "0.9rem", textAlign: "center" }}>
                                                    Hinh xem truoc se hien thi tai day sau khi ban tai anh len.
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={sectionCardSx}>
                            <Stack
                                direction={{ xs: "column-reverse", sm: "row" }}
                                spacing={1.5}
                                justifyContent="flex-end"
                                alignItems="center"
                                sx={{ p: { xs: 2, md: 2.25 } }}
                            >
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={onClose}
                                    sx={{
                                        ...actionButtonSx,
                                        borderColor: "#cbd5e1",
                                        color: "#475569",
                                        backgroundColor: "#ffffff",
                                        "&:hover": {
                                            borderColor: "#94a3b8",
                                            backgroundColor: "#f8fafc",
                                        },
                                    }}
                                >
                                    Huy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting}
                                    sx={{
                                        ...actionButtonSx,
                                        background: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
                                        boxShadow: "0 14px 28px rgba(100, 116, 139, 0.22)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #475569 0%, #7c8ea5 100%)",
                                        },
                                    }}
                                >
                                    {isSubmitting ? "Dang them..." : "Them san pham"}
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            </Box>
        </Paper>
    );
};

export default AddProductForm;
