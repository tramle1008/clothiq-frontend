import { MenuItem, FormControl, InputLabel, Select, Button } from '@mui/material';
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

const ReusableFilter = ({
    filterLabel = "Category",
    filterParam = "categoryId",
    filterList = [],
    searchEnabled = true,
    sortEnabled = true,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selected, setSelected] = useState("all");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchText, setSearchText] = useState("");

    // Sync URL params with state
    useEffect(() => {
        const current = searchParams.get(filterParam);
        const valid = current ?? "all"; // default = all
        setSelected(valid);

        const sort = searchParams.get("sortOrder") || "asc";
        const key = searchParams.get("key") || "";
        setSortOrder(sort);
        setSearchText(key);
    }, [searchParams, filterParam]);


    // Handlers
    const handleFilterChange = (e) => {
        const val = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        if (val === "all") {
            newParams.delete(filterParam);
        } else {
            newParams.set(filterParam, val);
        }
        newParams.set("page", "1");
        setSelected(val);
        setSearchParams(newParams);
    };

    const toggleSort = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        const newParams = new URLSearchParams(searchParams);
        newParams.set("sortOrder", newOrder);
        newParams.set("page", "1");
        setSortOrder(newOrder);
        setSearchParams(newParams);
    };

    const handleSearchSubmit = () => {
        const newParams = new URLSearchParams(searchParams);
        if (searchText.trim()) {
            newParams.set("key", searchText.trim());
        } else {
            newParams.delete("key");
        }
        newParams.set("page", "1");
        setSearchParams(newParams);
    };

    const handleClearFilter = () => {
        const cleared = new URLSearchParams();
        setSearchParams(cleared);
    };

    if (filterParam == "status") {
        searchEnabled = false;
    }
    return (
        <div className="flex lg:flex-row flex-col-reverse lg:justify-between gap-4">
            {searchEnabled && (
                <div className="relative flex items-center 2xl:w-[450px] sm:w-[420px] w-full">

                    <FaSearch
                        className="absolute left-3 text-gray-500 cursor-pointer"
                        onClick={handleSearchSubmit}
                    />

                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onBlur={handleSearchSubmit}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                        placeholder="Search..."
                        className="border border-gray-400 text-slate-800 bg-white/80 rounded-md py-2 pl-10 pr-4 w-full"
                    />
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-2 items-center px-4">
                {filterList.length > 0 && (
                    <FormControl variant="outlined" size="small">
                        <InputLabel id="filter-label" shrink
                        >{filterLabel}</InputLabel>
                        <Select
                            labelId="filter-label"
                            value={selected ?? "all"}
                            onChange={handleFilterChange}
                            label={filterLabel}
                        >
                            <MenuItem value="all">Tất cả sản phẩm</MenuItem>
                            {filterList.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {sortEnabled && (
                    <Button variant="outlined" color="success" onClick={toggleSort}>
                        Sort {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />}
                    </Button>
                )}

                <Button variant="outlined" color="error" onClick={handleClearFilter}>
                    Clear
                </Button>
            </div>
        </div>
    );
};
export default ReusableFilter;
