// third-party
import { createSlice } from '@reduxjs/toolkit';

// initial state
const initialState = {
    kisko: {
        name: '',
        customerName: '',
    }
};

// ==============================|| SLICE - common ||============================== //

const common = createSlice({
    name: 'common',
    initialState,
    reducers: {
        setSelectedKisko(state, action) {
            state.kisko = action.payload.kisko;
        }
    }
});

export default common.reducer;

export const { setSelectedKisko } = common.actions;
