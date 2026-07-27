import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar, FaUserCircle, FaTrashAlt, FaEdit, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../../../../api/api";
import { getAuthToken, getStoredAuth } from "../../../../utils/auth";

const emptyForm = {
    rating: 5,
    comment: "",
};

const formatDate = (value) => {
    if (!value) {
        return "Vừa xong";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const clampRating = (value) => Math.min(5, Math.max(1, Number(value) || 0));

const StarRating = ({ value = 0, sizeClass = "h-4 w-4", interactive = false, onChange }) => {
    const rating = clampRating(value);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const Icon = star <= rating ? FaStar : FaRegStar;

                if (interactive) {
                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange?.(star)}
                            className="text-amber-400 transition hover:scale-110"
                            aria-label={`Chọn ${star} sao`}
                        >
                            <Icon className={sizeClass} />
                        </button>
                    );
                }

                return <Icon key={star} className={`${sizeClass} text-amber-400`} />;
            })}
        </div>
    );
};

const ProductReview = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const storedAuth = getStoredAuth();
    const currentUserId = storedAuth?.id ? Number(storedAuth.id) : null;
    const isLoggedIn = Boolean(getAuthToken());

    const currentUserReview = useMemo(() => {
        if (!currentUserId) {
            return null;
        }

        return reviews.find((review) => Number(review.userId) === currentUserId) || null;
    }, [currentUserId, reviews]);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                setLoading(true);
                setError("");

                const [reviewsResponse, averageResponse] = await Promise.all([
                    api.get(`/products/${productId}/reviews`),
                    api.get(`/products/${productId}/reviews/average`),
                ]);

                const nextReviews = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];

                nextReviews.sort((left, right) => {
                    const leftTime = new Date(left.reviewDate || 0).getTime();
                    const rightTime = new Date(right.reviewDate || 0).getTime();
                    return rightTime - leftTime;
                });

                setReviews(nextReviews);
                setAverageRating(Number(averageResponse.data || 0));
            } catch (requestError) {
                console.error(requestError);
                setError("Không thể tải đánh giá của sản phẩm.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            loadReviews();
        }
    }, [productId]);

    useEffect(() => {
        if (currentUserReview) {
            setForm({
                rating: clampRating(currentUserReview.rating),
                comment: currentUserReview.comment || "",
            });
            setEditingReviewId(currentUserReview.id);
            return;
        }

        setForm(emptyForm);
        setEditingReviewId(null);
    }, [currentUserReview]);

    const reviewCount = reviews.length;

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isLoggedIn) {
            toast.error("Bạn cần đăng nhập để gửi đánh giá.");
            return;
        }

        const rating = clampRating(form.rating);
        const comment = form.comment.trim();

        if (!rating) {
            toast.error("Vui lòng chọn số sao đánh giá.");
            return;
        }

        if (!comment) {
            toast.error("Vui lòng nhập nội dung đánh giá.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                rating,
                comment,
                productId: Number(productId),
            };

            if (editingReviewId) {
                await api.put(`/reviews/${editingReviewId}`, payload);
                toast.success("Đã cập nhật đánh giá.");
            } else {
                await api.post("/reviews", payload);
                toast.success("Đã gửi đánh giá.");
            }

            const [reviewsResponse, averageResponse] = await Promise.all([
                api.get(`/products/${productId}/reviews`),
                api.get(`/products/${productId}/reviews/average`),
            ]);

            const nextReviews = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];
            nextReviews.sort((left, right) => {
                const leftTime = new Date(left.reviewDate || 0).getTime();
                const rightTime = new Date(right.reviewDate || 0).getTime();
                return rightTime - leftTime;
            });

            setReviews(nextReviews);
            setAverageRating(Number(averageResponse.data || 0));

            const refreshedOwnReview = nextReviews.find((review) => Number(review.userId) === currentUserId);
            if (refreshedOwnReview) {
                setEditingReviewId(refreshedOwnReview.id);
                setForm({
                    rating: clampRating(refreshedOwnReview.rating),
                    comment: refreshedOwnReview.comment || "",
                });
            } else {
                setForm(emptyForm);
                setEditingReviewId(null);
            }
        } catch (requestError) {
            const message = requestError?.response?.data?.message || requestError?.response?.data || "Không thể gửi đánh giá.";
            toast.error(String(message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (review) => {
        setForm({
            rating: clampRating(review.rating),
            comment: review.comment || "",
        });
        setEditingReviewId(review.id);
    };

    const handleCancelEdit = () => {
        if (currentUserReview) {
            setForm({
                rating: clampRating(currentUserReview.rating),
                comment: currentUserReview.comment || "",
            });
            setEditingReviewId(currentUserReview.id);
            return;
        }

        setForm(emptyForm);
        setEditingReviewId(null);
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) {
            return;
        }

        try {
            setDeleteLoadingId(reviewId);
            await api.delete(`/reviews/${reviewId}`);

            const [reviewsResponse, averageResponse] = await Promise.all([
                api.get(`/products/${productId}/reviews`),
                api.get(`/products/${productId}/reviews/average`),
            ]);

            const nextReviews = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];
            nextReviews.sort((left, right) => {
                const leftTime = new Date(left.reviewDate || 0).getTime();
                const rightTime = new Date(right.reviewDate || 0).getTime();
                return rightTime - leftTime;
            });

            setReviews(nextReviews);
            setAverageRating(Number(averageResponse.data || 0));
            setEditingReviewId(null);
            setForm(emptyForm);
            toast.success("Đã xóa đánh giá.");
        } catch (requestError) {
            const message = requestError?.response?.data?.message || requestError?.response?.data || "Không thể xóa đánh giá.";
            toast.error(String(message));
        } finally {
            setDeleteLoadingId(null);
        }
    };

    return (
        <section className="mx-auto mt-8 max-w-screen-2xl pb-10">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-5 py-5 sm:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900">Phản hồi từ khách hàng</h2>
                        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-slate-900">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                    {reviewCount} đánh giá
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <StarRating value={Math.round(averageRating)} sizeClass="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 px-5 py-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
                    <aside className="space-y-5">
                        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-900">
                                    {editingReviewId ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
                                </h3>

                            </div>

                            {!isLoggedIn ? (
                                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                                    Bạn cần đăng nhập để gửi đánh giá cho sản phẩm này.
                                    <div className="mt-3">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                        >
                                            Đăng nhập
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Đánh giá của bạn
                                        </label>
                                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                                            <StarRating
                                                value={form.rating}
                                                interactive
                                                onChange={(value) => setForm((prev) => ({ ...prev, rating: value }))}
                                                sizeClass="h-6 w-6"
                                            />
                                            <span className="text-sm font-semibold text-slate-700">
                                                {clampRating(form.rating)} / 5
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-slate-700">
                                            Nhận xét
                                        </label>
                                        <textarea
                                            id="review-comment"
                                            rows={5}
                                            value={form.comment}
                                            onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                                            placeholder="Chỉ có thể đánh giá nếu bạn từng mua sản phẩm này."
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="ml-auto inline-flex items-center rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
                                        >
                                            {submitting ? (
                                                <>
                                                    <FaSpinner className="mr-2 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : editingReviewId ? (
                                                "Cập nhật đánh giá"
                                            ) : (
                                                "Gửi đánh giá"
                                            )}
                                        </button>

                                        {editingReviewId && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Hủy chỉnh sửa
                                            </button>
                                        )}
                                    </div>

                                    {currentUserReview && (
                                        <p className="text-xs leading-5 text-slate-500">
                                            Bạn đã đánh giá sản phẩm này. Có thể cập nhật hoặc xóa đánh giá ở danh sách bên dưới.
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-900">Tóm tắt</h3>
                                <span className="text-sm font-semibold text-slate-500">{reviewCount} mục</span>
                            </div>
                            <div className="mt-4 space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = reviews.filter((review) => clampRating(review.rating) === star).length;
                                    const percent = reviewCount ? (count / reviewCount) * 100 : 0;

                                    return (
                                        <div key={star} className="flex items-center gap-3 text-sm text-slate-600">
                                            <div className="flex w-10 items-center gap-1 font-medium text-slate-700">
                                                {star}
                                                <FaStar className="h-3 w-3 text-amber-400" />
                                            </div>
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-amber-400"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-xs font-semibold text-slate-500">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
                                Đang tải đánh giá...
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-sm font-medium text-rose-700">
                                {error}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
                                <p className="text-base font-semibold text-slate-900">Chưa có đánh giá nào</p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Hãy là người đầu tiên chia sẻ trải nghiệm với sản phẩm này.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => {
                                    const isOwnReview = currentUserId && Number(review.userId) === currentUserId;

                                    return (
                                        <article
                                            key={review.id}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                                        <FaUserCircle className="h-7 w-7" />
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-slate-900">
                                                                {review.userName || "Khách hàng"}
                                                            </h4>
                                                            {isOwnReview && (
                                                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                                    Của bạn
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {formatDate(review.reviewDate)}
                                                        </p>
                                                        <div className="mt-2">
                                                            <StarRating value={review.rating} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {isOwnReview && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(review)}
                                                            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            <FaEdit className="mr-2" />
                                                            Sửa
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(review.id)}
                                                            disabled={deleteLoadingId === review.id}
                                                            className="inline-flex items-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <FaTrashAlt className="mr-2" />
                                                            {deleteLoadingId === review.id ? "Đang xóa..." : "Xóa"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                                                {review.comment || "Không có nhận xét."}
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductReview;
