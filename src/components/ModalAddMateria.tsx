import { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  DialogTitle,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import { iMateriaToEdit } from "../interfaces";

interface ModalAddMateriaProps {
  onAdd: (materia: {
    nome: string;
    faltas: number;
    semana: number;
    id_materia: string;
  }) => void;
  onEdit: (materia: {
    nome: string;
    faltas: number;
    faltas_active: number;
    semana: number;
    id_materia: string;
  }) => void;
  onClose: () => void;
  materiaToEdit: iMateriaToEdit | null;
}

function ModalAddMateria(props: ModalAddMateriaProps) {
  useEffect(() => {
    if (props.materiaToEdit) {
      setNome(props.materiaToEdit.nome);
      setFaltas(props.materiaToEdit.faltas.length);
      setSemana(props.materiaToEdit.semana);
      setIdMateria(props.materiaToEdit.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nome, setNome] = useState("");
  const [faltas, setFaltas] = useState(1);
  const [semana, setSemana] = useState(1);
  const [id_materia, setIdMateria] = useState("");

  const actions = {
    handleSave() {
      if (!nome || nome.trim() == "" || !semana) {
        toast.warning("Preencha todos os campos");
        return;
      }

      if (faltas < 1 || faltas > 99) {
        toast.warning("O número de faltas deve ser entre 1 e 99");
        return;
      }

      if (props.materiaToEdit) {
        props.onEdit({
          nome,
          faltas,
          faltas_active: props.materiaToEdit.faltas_active,
          semana,
          id_materia,
        });

        return;
      }

      props.onAdd({ nome, faltas, semana, id_materia });
    },
  };

  return (
    <Box>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <DialogTitle sx={{ padding: 0 }}>
          {props.materiaToEdit ? "Editar Matéria" : "Adicionar Matéria"}
        </DialogTitle>
        <IconButton size="small" onClick={props.onClose}>
          <Close fontSize="medium"></Close>
        </IconButton>
      </div>
      <Grid sx={{ marginTop: "4px" }} container spacing={2} direction="column">
        <Grid item xs={12}>
          <TextField
            label="Nome da Matéria"
            variant="outlined"
            fullWidth
            inputProps={{ maxLength: 25 }}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Faltas"
                type="number"
                variant="outlined"
                fullWidth
                value={faltas}
                onChange={(e) => setFaltas(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Dia da Semana</InputLabel>
                <Select
                  value={semana}
                  onChange={(e) => setSemana(Number(e.target.value))}
                  label="Dia da Semana"
                >
                  {[
                    { title: "Segunda", value: 1 },
                    { title: "Terça", value: 2 },
                    { title: "Quarta", value: 3 },
                    { title: "Quinta", value: 4 },
                    { title: "Sexta", value: 5 },
                    { title: "Sábado", value: 6 },
                    { title: "Domingo", value: 7 },
                  ].map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <DialogActions sx={{ padding: 0, marginTop: "16px" }}>
        <Button
          onClick={actions.handleSave}
          sx={{
            backgroundColor: "#c8eaca",
            color: "black",
          }}
          variant="contained"
        >
          Salvar
        </Button>
      </DialogActions>
      <ToastContainer />
    </Box>
  );
}

export default ModalAddMateria;
