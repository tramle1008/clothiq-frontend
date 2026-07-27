import {
    createStoreApi,
    deleteStoreApi,
    getStoresApi,
    updateStoreApi,
} from "../../api/storeBranchApi";

export const fetchStoreBranches = () => async (dispatch) => {
    dispatch({ type: "STORE_BRANCH_REQUEST" });

    try {
        const data = await getStoresApi();

        dispatch({
            type: "STORE_BRANCH_SUCCESS",
            payload: Array.isArray(data) ? data : [],
        });
    } catch (error) {
        dispatch({
            type: "STORE_BRANCH_FAILURE",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const createStoreBranch = (payload) => async (dispatch) => {
    dispatch({ type: "STORE_BRANCH_MUTATION_REQUEST" });

    try {
        const data = await createStoreApi(payload);

        dispatch({
            type: "STORE_BRANCH_CREATE_SUCCESS",
            payload: data,
        });

        return data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        dispatch({ type: "STORE_BRANCH_FAILURE", payload: message });
        throw error;
    }
};

export const updateStoreBranch = (id, payload) => async (dispatch) => {
    dispatch({ type: "STORE_BRANCH_MUTATION_REQUEST" });

    try {
        const data = await updateStoreApi(id, payload);

        dispatch({
            type: "STORE_BRANCH_UPDATE_SUCCESS",
            payload: data,
        });

        return data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        dispatch({ type: "STORE_BRANCH_FAILURE", payload: message });
        throw error;
    }
};

export const deleteStoreBranch = (id) => async (dispatch) => {
    dispatch({ type: "STORE_BRANCH_MUTATION_REQUEST" });

    try {
        await deleteStoreApi(id);

        dispatch({
            type: "STORE_BRANCH_DELETE_SUCCESS",
            payload: id,
        });
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        dispatch({ type: "STORE_BRANCH_FAILURE", payload: message });
        throw error;
    }
};

export const replaceStoreBranches = (stores) => ({
    type: "STORE_BRANCH_SUCCESS",
    payload: Array.isArray(stores) ? stores : [],
});
