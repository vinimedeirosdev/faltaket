import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./app.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { iUser } from "./store/globalInterface";
import faltaketService from "./services/faltaket.service";
import globalState from "./store/globalState";
import { useEffect } from "react";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const user: iUser = JSON.parse(localStorage.getItem("user") as string);
    if (user) {
      actions.login(user.user, user.password);
    } else {
      navigate("/");
    }
  }, []);

  const actions = {
    async login(user: string, password: string) {
      try {
        const data = await faltaketService.login(user, password);

        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));
          globalState.user = { ...data.user };
          navigate("/home");
        }
      } catch (error) {
        console.error("Error login:", error);
      }
    },
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
