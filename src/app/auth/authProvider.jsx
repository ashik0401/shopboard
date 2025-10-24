"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase.init";
import { useDispatch } from "react-redux";
import { loginUser, logoutUser } from "@/redux/authSlice";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const serializableUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        dispatch(loginUser.fulfilled(serializableUser));
      } else {
        dispatch(logoutUser.fulfilled());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return children;
}
