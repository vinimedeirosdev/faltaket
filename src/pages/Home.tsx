import globalState from "../store/globalState";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h1>{globalState.user.name}</h1>
      <button onClick={actions.onClickLogout}>Logout</button>
    </div>
  );
}

export default Home;
