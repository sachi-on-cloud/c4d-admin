// import { configureStore, createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   user: {
//     name: '',
//     role: '',
//     permissions: [],
//   },
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
//       const { user, permissions } = action.payload;
//       state.user = { ...user, permissions };
//     },
//   },
// });

// export const { setUser } = authSlice.actions;
// const store = configureStore({ reducer: { auth: authSlice.reducer } });

// export default store;