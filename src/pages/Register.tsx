import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Container,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import backgroundLogin from "../assets/peakpx.jpg";
//@ts-ignore
import "@fontsource/caveat";
import faltaketService from "../services/faltaket.service";
import { ToastContainer, toast } from "react-toastify";
import globalState from "../store/globalState";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Register() {
  const [name, setName] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const actions = {
    handleClickShowPassword() {
      setShowPassword(!showPassword);
    },

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
        setLoading(true);
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
      } finally {
        setLoading(false);
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Usuário"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading) {
                  actions.onClickRegister();
                }
              }}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={actions.handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#aedfb1", color: "black" }}
              onClick={actions.onClickRegister}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Cadastrar"
              )}
            </Button>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#b2dcf9", color: "black" }}
              onClick={() => navigate("/")}
              disabled={loading}
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
