import { useState } from "react";
import { Box, TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import backgroundLogin from "../assets/peakpx.jpg";
//@ts-ignore
import "@fontsource/caveat";
import faltaketService from "../services/faltaket.service";
import { ToastContainer, toast } from "react-toastify";
import globalState from "../store/globalState";

function Register() {
  const [name, setName] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const actions = {
    async onClickRegister() {
      if (
        !name ||
        name.trim() == "" ||
        !user ||
        user.trim() == "" ||
        !password ||
        password.trim() == ""
      ) {
        toast.warning("Todos os campos devem ser preenchidos.");
        return;
      }

      actions.register();
    },

    async register() {
      try {
        const data = await faltaketService.register({
          name: name,
          user: user,
          password: password,
        });

        if (data.success) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              name: name,
              user: user,
              password: password,
              id: data.id,
            })
          );

          globalState.user = {
            name: name,
            user: user,
            id: data.id,
            password: password,
          };

          navigate("/home");
        } else {
          toast.warning(data.msg);
        }
      } catch (error) {
        toast.error("Erro ao registrar. Tente novamente.");
        console.error(error);
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
            Cadastro
          </Typography>
          <Box>
            <TextField
              margin="normal"
              fullWidth
              label="Nome"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Usuário"
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
                  actions.onClickRegister();
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#aedfb1", color: "black" }}
              onClick={actions.onClickRegister}
            >
              Cadastrar
            </Button>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#b2dcf9", color: "black" }}
              onClick={() => navigate("/")}
            >
              Voltar
            </Button>
          </Box>
        </Box>
      </Container>
      <ToastContainer />
    </Box>
  );
}

export default Register;
