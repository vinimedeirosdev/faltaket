import { Avatar, Fab, Icon } from "@mui/material";
import globalState from "../store/globalState";
import { useNavigate } from "react-router-dom";
import { Add } from "@mui/icons-material";
import avatarImg from "../assets/avatarImg.jpg";

function Home() {
  const navigate = useNavigate();

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

        <Fab
          size="medium"
          sx={{}}
          onClick={() => {
            /* sua função de clique aqui */
          }}
        >
          <Avatar
            sx={{ width: "100%", height: "100%" }}
            src={avatarImg}
          ></Avatar>
        </Fab>
      </div>
    </div>
  );
}

export default Home;
