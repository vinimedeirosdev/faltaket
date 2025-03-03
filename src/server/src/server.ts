import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import Ctrl from './ctrl'; // Supondo que você tenha a classe Ctrl no arquivo ctrl.ts

const app = express();
const db = new Database('database.sqlite');

app.use(cors());
app.use(express.json());

// Cria a tabela (caso não exista)
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        user TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// Classe Router para organizar as rotas
class Router {
    private conexao;
    private ctrl;

    constructor(conexao: Database) {
        this.conexao = conexao;
        this.ctrl = new Ctrl(this.conexao); // Supondo que a classe Ctrl usa o banco
    }

    // Definindo os métodos de roteamento
    public routes(app: express.Application) {
        // Rota para listar usuários
        app.get('/users', (req, res) => {
            const users = this.conexao.prepare('SELECT * FROM users').all();
            res.json(users);
        });

        // Rota para adicionar um usuário
        app.post('/register', async (req, res) => {
            const { name, user, password } = req.body;
            const result = await this.ctrl.register({ name, user, password });
            res.json(result);
        });

        app.post('/login', async (req, res) => {
            const { user, password } = req.body;
            const result = await this.ctrl.login(user, password);
            res.json(result);
        })
    }
}

const router = new Router(db);
router.routes(app); // Chama os métodos de rota da classe Router

// Porta do servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
