import {
  Avatar,
  Divider,
  Fab,
  Icon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import globalState from "../store/globalState";
import { useNavigate } from "react-router-dom";
import { Add, Logout, Person } from "@mui/icons-material";
import avatarImg from "../assets/avatarImg.jpg";
import { useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const actions = {
    async onClickLogout() {
      localStorage.removeItem("user");
      globalState.user = {
        id: 0,
        name: "",
        user: "",
        password: "",
      };

      navigate("/");
    },

    handleOpenMenu(event: React.MouseEvent<HTMLElement>) {
      setAnchorEl(event.currentTarget);
    },

    handleCloseMenu() {
      setAnchorEl(null);
    },
  };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Fab
          aria-label="add"
          size="medium"
          sx={{
            backgroundColor: "#c4b5fd",
            color: "black",
            "&:hover": {
              backgroundColor: "#c4b5fd",
            },
          }}
          onClick={() => {
            /* sua função de clique aqui */
          }}
        >
          <Icon sx={{ marginBottom: "8px" }}>
            <Add color="secondary" />
          </Icon>
        </Fab>

        <Fab size="medium" sx={{}} onClick={actions.handleOpenMenu}>
          <Avatar
            sx={{ width: "100%", height: "100%" }}
            src={avatarImg}
          ></Avatar>
        </Fab>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={actions.handleCloseMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem>
            <Person fontSize="small" sx={{ mr: 1 }} />
            Perfil
          </MenuItem>
          <Divider />
          <MenuItem onClick={actions.onClickLogout}>
            <Logout fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </div>

      <div
        style={{
          marginTop: "16px",
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
      </div>

      <div style={{ marginTop: "16px" }}></div>
    </div>
  );
}

export default Home;
