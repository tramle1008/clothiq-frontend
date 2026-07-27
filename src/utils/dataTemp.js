import { Description } from "@headlessui/react";

const FILE_URL = import.meta.env.VITE_FRONT_END_URL;

export const bannerList = [
    {
        id: 1,
        image: `${FILE_URL}/public/clothiq.png`,
        title: "Quần Áo",

        description: "Thiết kế hiện đại và tinh tế.",
    },
    {
        id: 2,
        image: `${FILE_URL}/public/clothiq.png`,
        title: "Trang sức",

        description: "Sang trọng và thoải mái.",
    },
    {
        id: 3,
        image: `${FILE_URL}/public/clothiq.png`,
        title: "Nón",
        description: "Phong cách và cá tính.",
    },
    {
        id: 4,
        image: `${FILE_URL}/public/clothiq.png`,
        title: "Giày dép",
        description: "Năng động và thời trang.",
    },
]
