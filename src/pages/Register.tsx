import { useState } from 'react'
import { 
  Box, 
  TextField, 
  Button, 
  Container, 
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import backgroundLogin from '../assets/peakpx.jpg'
//@ts-ignore
import '@fontsource/caveat'
import faltaketService from '../services/faltaket.service'

function Register() {
  const [name, setName] = useState('')
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const actions = {
    async register() {
      try {
        const data = await faltaketService.register({
          name: name,
          user: user,
          password: password,
        })        

        if(data.success) {
          navigate('/')
        }

      } catch (error) {
        console.error('Error registering:', error)
      }
    }
  }

  return (
    <Box sx={{
      backgroundImage: `url(${backgroundLogin})`,
      backgroundSize: 'cover',
      height: 'calc(100vh - 18px)',
    }}>
      <Container component="main" maxWidth="xs">
        <Box sx={{
          paddingY: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography 
            variant="h2" 
            align="center"
            sx={{ 
              fontFamily: 'Caveat',
            }}
          >
            Cadastro
          </Typography>
          <Box>
            <TextField
              margin="normal"
              fullWidth
              label="Nome"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Usuário"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: '#aedfb1', color: 'black' }}
              onClick={actions.register}
            >
              Cadastrar
            </Button>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: '#b2dcf9', color: 'black' }}
              onClick={() => navigate('/')}
            >
              Voltar
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Register
