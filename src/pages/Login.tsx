import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Container, Typography } from "@mui/material";

import backgroundLogin from "../assets/peakpx.jpg";
//@ts-ignore
import "@fontsource/caveat";
import faltaketService from "../services/faltaket.service";
import { ToastContainer, toast } from "react-toastify";
import globalState from "../store/globalState";

function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const actions = {
    async onClickLogin() {
      if (!user || user.trim() == "" || !password || password.trim() == "") {
        toast.warning("Todos os campos devem ser preenchidos.");
        return;
      }
      actions.login(user, password);
    },

    async login(user: string, password: string) {
      try {
        const data = await faltaketService.login(user, password);

        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));

          globalState.user = { ...data.user };

          navigate("/home");
        } else {
          toast.warning(data.msg);
        }
      } catch (error) {
        toast.error("Erro ao efetuar o login.");
        console.error("Error login:", error);
      }
    },
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundLogin})`,
        backgroundSize: "cover",
        height: "calc(100vh - 18px)",
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            paddingY: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontFamily: "Caveat",
            }}
          >
            Faltaket
          </Typography>
          <Box>
            <TextField
              margin="normal"
              fullWidth
              label="Usuário"
              autoFocus
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  actions.onClickLogin();
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => actions.onClickLogin()}
              sx={{ mt: 2, backgroundColor: "#aedfb1", color: "black" }}
            >
              Login
            </Button>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#b2dcf9", color: "black" }}
              onClick={() => navigate("/register")}
            >
              Cadastrar
            </Button>
          </Box>
        </Box>
      </Container>
      <ToastContainer />
    </Box>
  );
}

export default Login;
