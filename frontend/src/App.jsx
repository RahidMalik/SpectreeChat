import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Signup from "./pages/SignUpPage";
import ChatPage from "./pages/ChatPage";
import { userAuthStore } from "./store/useAuthstore";
import { useEffect } from "react";
import PageLoader from "./Components/PageLoader";
import { Toaster } from "react-hot-toast"


export default function App() {
  const { authuser, isCheckingAuth, checkAuth } = userAuthStore()

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />

  return (


    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <Routes>
        {/* Home route */}
        <Route path="/" element={authuser ? <ChatPage /> : <Navigate to={"/login"} />} />
        <Route path="/signup" element={!authuser ? <Signup /> : <Navigate to={"/"} />} />
        <Route path="/login" element={!authuser ? <LoginPage /> : <Navigate to={"/"} />} />
      </Routes>
      <Toaster />

    </div>
  );
}
