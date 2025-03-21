import {
  Avatar,
  Box,
  Divider,
  Fab,
  Icon,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";
import globalState from "../store/globalState";
import { useNavigate } from "react-router-dom";
import { Add, Logout, Person } from "@mui/icons-material";
import avatarImg from "../assets/avatarImg.jpg";
import { useEffect, useState } from "react";
import CardMateria from "../components/CardMateria";
import backgroundHome from "../assets/9c1946a1386fcd9aa8a7c1c6f3169b1f.jpg";
import service from "../services/faltaket.service";
import { iFalta, iGetMateriasResponse, iPropsAddMateria } from "../interfaces";
import ModalAddMateria from "../components/ModalAddMateria";
import LoadingOverlay from "../components/LoadingOverlay";

function Home() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [materia, setMateria] = useState<iGetMateriasResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // New state for dialog
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    actions.getMaterias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = {
    async onClickLogout() {
      localStorage.removeItem("user");
      globalState.user = {
        id: "",
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

    async getMaterias() {
      try {
        setLoading(true);

        const data = await service.getMaterias(globalState.user.id.toString());

        if (data.length > 0) {
          data.sort((a, b) => a.semana - b.semana);

          data.forEach((item) => {
            item.faltas.sort((a, b) => a.indice - b.indice);
          });
        }

        setMateria(data);
      } catch (error) {
        console.error("Error getMaterias:", error);
      } finally {
        setLoading(false);
      }
    },

    handleOpenDialog() {
      setOpenDialog(true);
    },

    handleCloseDialog() {
      setOpenDialog(false);
    },

    async handleAddMateria(newMateria: iPropsAddMateria) {
      try {
        setOpenDialog(false);

        setLoading(true);

        const data = await service.addMateria({
          id_user: globalState.user.id,
          nome: newMateria.nome,
          faltas: newMateria.faltas,
          semana: newMateria.semana,
        });

        if (data.success) {
          const faltas: iFalta[] = [];

          for (let i = 1; i <= newMateria.faltas; i++) {
            faltas.push({
              indice: i,
              active: false,
            });
          }

          const newMateriaData: iGetMateriasResponse = {
            nome: newMateria.nome,
            semana: newMateria.semana,
            faltas: faltas,
            id: data.id_materia,
          };

          setMateria((prevMaterias) => {
            const materias = [...prevMaterias, newMateriaData];
            return materias.sort((a, b) => a.semana - b.semana);
          });
        }
      } catch (error) {
        console.error("Error adding materia:", error);
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundHome})`,
        backgroundSize: "cover",
        height: "calc(100vh - 18px)",
      }}
    >
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
            onClick={actions.handleOpenDialog}
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

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          {materia.map((item) => (
            <CardMateria key={item.id} materia={item} />
          ))}
        </div>
      </div>

      <Dialog
        open={openDialog}
        PaperProps={{
          style: {
            backgroundColor: "#ede9fe",
          },
        }}
      >
        <DialogContent>
          <ModalAddMateria
            onAdd={actions.handleAddMateria}
            onClose={actions.handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
      <LoadingOverlay loading={loading} />
    </Box>
  );
}

export default Home;
