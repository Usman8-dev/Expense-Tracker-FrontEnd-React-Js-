import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./Pages/Auths/Register";
import Login from "./Pages/Auths/Login";

import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout";
import dashboard from "./Pages/dashboard";
function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>

            <ToastProvider>
     
              <Routes>
                <Route path="/register" element={<Register/>} />
                <Route path="/" element={<Login/>} />

                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<dashboard/>} />
                </Route>
              </Routes>
            </ToastProvider>

        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
