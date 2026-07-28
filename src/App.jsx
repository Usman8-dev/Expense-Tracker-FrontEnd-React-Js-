import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./Pages/Auths/Register";
import Login from "./Pages/Auths/Login";

import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout";
import Dashboard from "./Pages/dashboard";
import AllTransactions from "./Pages/AllTransactions";
import Create from "./Pages/Expense/Create";
import EditTransaction from "./Pages/Expense/Edit";

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
                  <Route path="/dashboard" element={<Dashboard/>} />
                  <Route path="/expenses/all" element={<AllTransactions/>} />

                  <Route path="/expenses/create" element={<Create/>} />
                  <Route path="/expenses/edit/:id" element={<EditTransaction/>} />
                </Route>
              </Routes>
            </ToastProvider>

        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
