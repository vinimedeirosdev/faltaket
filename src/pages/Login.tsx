import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const actions = {
    handleClickShowPassword() {
      setShowPassword(!showPassword);
    },

    async onClickLogin() {
      if (!user || user.trim() == "" || !password || password.trim() == "") {
        toast.warning("Todos os campos devem ser preenchidos.");
        return;
      }
      actions.login(user, password);
    },

    async login(user: string, password: string) {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  actions.onClickLogin();
                }
              }}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={actions.handleClickShowPassword}
                      edge="end"
                      disabled={isLoading}
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
              onClick={() => actions.onClickLogin()}
              sx={{ mt: 2, backgroundColor: "#aedfb1", color: "black" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#b2dcf9", color: "black" }}
              onClick={() => navigate("/register")}
              disabled={isLoading}
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
