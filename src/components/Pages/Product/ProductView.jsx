import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Button } from '@headlessui/react';

function ProductView({ open, setOpen, product }) {
    if (!product) return null;

    const {
        productName,
        image,
        description,
        quantity,
    } = product;

    const close = () => setOpen(false);

    return (
        <>
            <Dialog
                open={open}
                as="div"
                className="relative z-10 focus:outline-none"
                onClose={close}
            >
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-sm max-w-sm rounded-xl bg-white/80 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                        >
                            <DialogTitle as="h3" className="text-base/7 font-medium text-gray-700">
                                {productName}
                            </DialogTitle>
                            <img
                                src={image}
                                alt={productName}
                                className="mt-4 max-h-72 w-full object-contain rounded-lg"
                            />
                            <p className="mt-2 text-sm/6 text-black/50">
                                {description}
                            </p>
                            <p className="mt-2 text-sm/6 text-black/50">
                                số lượng: {quantity}
                            </p>
                            <div className="mt-4">
                                <Button
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                                    onClick={close}
                                >
                                    Got it, thanks!
                                </Button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
}

export default ProductView;
