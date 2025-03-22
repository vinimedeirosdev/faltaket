import { Delete, Edit } from "@mui/icons-material";
import {
  Checkbox,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { iFalta, iMaterias } from "../interfaces";
import { useEffect, useState } from "react";

interface Props {
  materia: iMaterias;
  deleteMateria: (id_materia: string) => void;
  editMateria: (id_materia: string) => void;
}

function CardMateria(props: Props) {
  useEffect(() => {
    setFaltas(props.materia.faltas);
  }, [props.materia.faltas]);

  const [faltas, setFaltas] = useState<iFalta[]>(props.materia.faltas);

  // Verifica se todos os checkboxes estão marcados
  const allFaltasActive =
    faltas.length > 0 && faltas.every((falta) => falta.active);

  // Verifica se falta apenas um checkbox para todos estarem marcados
  const missingOneFalta =
    faltas.length > 1 &&
    faltas.filter((falta) => falta.active).length === faltas.length - 1;

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

    activeFalta(indice: number) {
      setFaltas((prevFaltas) =>
        prevFaltas.map((falta) =>
          falta.indice == indice ? { ...falta, active: !falta.active } : falta
        )
      );
    },

    getCardColor() {
      if (allFaltasActive) return "#fca5a5"; // Vermelho claro
      if (missingOneFalta) return "#fff2cc"; // Amarelo claro
      return "#f7e6ff"; // Cor original
    },

    deleteMateria() {
      props.deleteMateria(props.materia.id);
    },

    editMateria() {
      props.editMateria(props.materia.id);
    },
  };

  return (
    <div>
      <Card
        sx={{
          backgroundColor: actions.getCardColor(),
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
              {actions.setSemana(props.materia.semana)}
            </Typography>
            <div>
              <IconButton onClick={actions.editMateria}>
                <Edit />
              </IconButton>
              <IconButton onClick={actions.deleteMateria}>
                <Delete />
              </IconButton>
            </div>
          </div>
          <Typography variant="h5" component="div">
            {props.materia.nome}
          </Typography>
        </CardContent>
        <CardActions
          sx={{ display: "flex", marginTop: "-20px", overflow: "auto" }}
        >
          {faltas.map((falta) => (
            <Checkbox
              key={falta.indice}
              color="secondary"
              size="large"
              checked={falta.active}
              onClick={() => {
                actions.activeFalta(falta.indice);
              }}
            />
          ))}
        </CardActions>
      </Card>
    </div>
  );
}

export default CardMateria;
