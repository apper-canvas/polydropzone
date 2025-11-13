import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "@/router";
import React from "react";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName={() =>
          "relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer"
        }
/>
    </>
  );
}