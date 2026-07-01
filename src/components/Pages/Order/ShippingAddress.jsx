import { Button } from "@headlessui/react";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAddresses } from "../../../store/actions";
import AddAdress from "../Auth/AddAdress";

const formatAddress = (addr) =>
    [addr?.detail, addr?.ward, addr?.province].filter(Boolean).join(", ");

const ShippingAddress = ({ onNext, setAddressId }) => {
    const dispatch = useDispatch();
    const [selectedId, setSelectedId] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const { addresses, loading, error } = useSelector(state => state.address);

    useEffect(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);

    const handleSelect = (id) => {
        setSelectedId(id);
        setAddressId(id);
    };

    const handleAddressAdded = () => {
        dispatch(fetchAddresses());
    };

    return (
        <div className="flex justify-center">
            <Box className="mx-4 mb-10 w-full max-w-2xl">
                <h1 className="text-center">Chon dia chi giao hang</h1>
                {loading && <p>Dang tai dia chi...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {addresses.length > 0 && (
                    <ul className="mb-2 space-y-2">
                        {addresses.map(addr => (
                            <li
                                key={addr.addressId}
                                className={`cursor-pointer rounded border p-3 ${selectedId === addr.addressId ? "bg-green-100" : "bg-gray-50"}`}
                                onClick={() => handleSelect(addr.addressId)}
                            >
                                <input
                                    type="radio"
                                    checked={selectedId === addr.addressId}
                                    onChange={() => handleSelect(addr.addressId)}
                                    className="mr-2"
                                />
                                {formatAddress(addr) || "--"} <br />
                                SDT: {addr.phoneNumber}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => setShowAddressModal(true)}
                        className="flex items-center rounded-md border border-b-blue-950 px-4 py-1 font-bold transition-colors duration-200 hover:bg-blue-100"
                    >
                        + Them dia chi
                    </button>
                </div>
                <Button
                    disabled={!selectedId}
                    onClick={onNext}
                    className={`rounded-md px-6 py-2 font-semibold transition duration-300
                         ${selectedId
                            ? "border border-blue-600 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white"
                            : "cursor-not-allowed bg-gray-300 text-gray-500"
                        }`}
                >
                    Tiep tuc
                </Button>
            </Box>

            <AddAdress
                open={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onAdded={handleAddressAdded}
            />
        </div>
    );
};

export default ShippingAddress;
