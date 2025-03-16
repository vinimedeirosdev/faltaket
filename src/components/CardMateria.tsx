import { Delete, Edit } from "@mui/icons-material";
import {
  Checkbox,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { iFalta, iGetMateriasResponse } from "../interfaces";
import { useState } from "react";

interface Props {
  materia: iGetMateriasResponse;
}

function CardMateria({ materia }: Props) {
  const [faltas, setFaltas] = useState<iFalta[]>(materia.faltas);

  const actions = {
    setSemana(value: number) {
      switch (value) {
        case 1:
          return "Segunda-Feira";
        case 2:
          return "Terça-Feira";
        case 3:
          return "Quarta-Feira";
        case 4:
          return "Quinta-Feira";
        case 5:
          return "Sexta-Feira";
        case 6:
          return "Sábado";
        case 7:
          return "Domingo";
        default:
          return "";
      }
    },

    activeFalta(id: string) {
      setFaltas((prevFaltas) =>
        prevFaltas.map((falta) =>
          falta.id == id ? { ...falta, active: !falta.active } : falta
        )
      );
    },
  };

  return (
    <div>
      <Card
        sx={{
          backgroundColor: "#f7e6ff",
          borderRadius: "16px",
        }}
      >
        <CardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <Typography
              gutterBottom
              sx={{ color: "text.secondary", fontSize: 14 }}
            >
              {actions.setSemana(materia.semana)}
            </Typography>
            <div>
              <IconButton>
                <Edit />
              </IconButton>
              <IconButton>
                <Delete />
              </IconButton>
            </div>
          </div>
          <Typography variant="h5" component="div">
            {materia.nome}
          </Typography>
        </CardContent>
        <CardActions
          sx={{ display: "flex", marginTop: "-20px", overflow: "auto" }}
        >
          {faltas.map((falta) => (
            <Checkbox
              key={falta.id}
              color="secondary"
              size="large"
              checked={falta.active}
              onClick={() => {
                actions.activeFalta(falta.id);
              }}
            />
          ))}
        </CardActions>
      </Card>
    </div>
  );
}

export default CardMateria;
