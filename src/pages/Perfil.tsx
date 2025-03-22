import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Checkbox,
  Fab,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import globalState from "../store/globalState";
import { useState } from "react";
import { iUser } from "../store/globalInterface";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import service from "../services/faltaket.service";
import LoadingOverlay from "../components/LoadingOverlay";
import avatarImg from "../assets/avatarImg.jpg";

function Perfil() {
  const [user, setUser] = useState(globalState.user.user);
  const [name, setName] = useState(globalState.user.name);
  const [alterarSenhaCheck, setAlterarSenhaCheck] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("");
  const [userOld, setUserOld] = useState<iUser>(globalState.user);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const actions = {
    handleClickShowPassword() {
      setShowPassword(!showPassword);
    },

    handleClickShowNewPassword() {
      setShowNewPassword(!showNewPassword);
    },

    hendleClickEdit() {
      if (editing) {
        actions.handleClickSave();
        return;
      }

      setEditing(true);
    },

    handleClickCancel() {
      if (editing) {
        setEditing(false);
        setName(userOld.name);
        setUser(userOld.user);
        setPassword("");
        setNewPassword("");
        setAlterarSenhaCheck(false);
        return;
      }

      navigate("/home");
    },

    async handleClickSave() {
      if (
        !name ||
        name.trim() == "" ||
        !user ||
        user.trim() == "" ||
        (alterarSenhaCheck && (!password || password.trim() == "")) ||
        (alterarSenhaCheck && (!newPassword || newPassword.trim() == ""))
      ) {
        toast.warning("Todos os campos devem ser preenchidos.");
        return;
      }

      if (name == userOld.name && user == userOld.user && !alterarSenhaCheck) {
        setEditing(false);
        return;
      }

      await actions.editUser();
    },

    async editUser() {
      try {
        setLoading(true);

        const data = await service.editUser({
          id_user: globalState.user.id,
          alterarSenha: alterarSenhaCheck,
          name,
          user,
          senha: password,
          newSenha: newPassword,
        });

        if (data.success) {
          setEditing(false);

          globalState.user.name = name;
          globalState.user.user = user;

          if (alterarSenhaCheck) {
            globalState.user.password = newPassword;
          }

          localStorage.setItem("user", JSON.stringify(globalState.user));

          setUserOld(globalState.user);
          actions.handleClickCancel();
        } else {
          toast.error(data.msg);
        }
      } catch (err) {
        console.error(err);
        return;
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <Fab
          sx={{
            width: "100px",
            height: "100px",
          }}
        >
          <Avatar
            src={avatarImg}
            sx={{
              width: "100px",
              height: "100px",
            }}
          ></Avatar>
        </Fab>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginTop: "24px",
        }}
      >
        <TextField
          margin="normal"
          label="Nome"
          variant="outlined"
          InputProps={{
            readOnly: !editing,
          }}
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          margin="normal"
          label="User"
          variant="outlined"
          fullWidth
          InputProps={{
            readOnly: !editing,
          }}
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Checkbox
            size="large"
            disabled={!editing}
            checked={alterarSenhaCheck}
            onChange={(e) => setAlterarSenhaCheck(e.target.checked)}
          />
          <Typography variant="h6" color="textSecondary">
            Alterar Senha
          </Typography>
        </div>

        <div>
          {alterarSenhaCheck && (
            <div>
              <TextField
                margin="normal"
                fullWidth
                label="Senha"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={actions.handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Nova Senha"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={actions.handleClickShowNewPassword}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={actions.hendleClickEdit}
            sx={{ backgroundColor: "#aedfb1", color: "black" }}
          >
            {editing ? "Salvar" : "Editar Dados"}
          </Button>
          <Button
            sx={{ backgroundColor: "#b2dcf9", color: "black" }}
            fullWidth
            onClick={actions.handleClickCancel}
            variant="contained"
            color="secondary"
          >
            {editing ? "Cancelar" : "Voltar"}
          </Button>
        </div>
      </div>
      <ToastContainer />
      <LoadingOverlay loading={loading} />
    </div>
  );
}

export default Perfil;
