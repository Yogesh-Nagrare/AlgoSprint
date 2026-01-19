import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice';
import editorReducer from "../redux/editorSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
        editor: editorReducer, // Add here

  }
});

export default store;
