const initialState = {
    stores: [],
    loading: false,
    saving: false,
    error: null,
};

export const storeBranchReducer = (state = initialState, action) => {
    switch (action.type) {
        case "STORE_BRANCH_REQUEST":
            return { ...state, loading: true, error: null };

        case "STORE_BRANCH_MUTATION_REQUEST":
            return { ...state, saving: true, error: null };

        case "STORE_BRANCH_SUCCESS":
            return {
                ...state,
                stores: action.payload,
                loading: false,
                saving: false,
                error: null,
            };

        case "STORE_BRANCH_CREATE_SUCCESS":
            return {
                ...state,
                stores: [...state.stores, action.payload],
                saving: false,
                error: null,
            };

        case "STORE_BRANCH_UPDATE_SUCCESS":
            return {
                ...state,
                stores: state.stores.map((store) =>
                    store.id === action.payload.id ? action.payload : store
                ),
                saving: false,
                error: null,
            };

        case "STORE_BRANCH_DELETE_SUCCESS":
            return {
                ...state,
                stores: state.stores.filter((store) => store.id !== action.payload),
                saving: false,
                error: null,
            };

        case "STORE_BRANCH_FAILURE":
            return {
                ...state,
                loading: false,
                saving: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
