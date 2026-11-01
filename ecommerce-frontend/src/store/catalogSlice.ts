import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductQuery } from "@/api/product.api";

interface CatalogState {
  query: ProductQuery;
}

const initialState: CatalogState = {
  query: { page: 1, limit: 12 },
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<ProductQuery>) {
      state.query = action.payload;
    },
  },
});

export const { setQuery } = catalogSlice.actions;
export default catalogSlice.reducer;
