import { iRegisterUserParam } from "./interfaces"
import Sql from "./sql"

class Ctrl {
    private sql: Sql

    constructor(conexao: any) {
        this.sql = new Sql(conexao)
    }

    async register(param: iRegisterUserParam) {
        const userExists = await this.sql.getUserByUser(param.user)

        if (userExists?.id) {
            return {
                success: false,
                msg: "Já existe uma conta com esse usuário."
            }
        }

        const registerUser = await this.sql.registerUser(param)

        return {
            success: true,
            msg: "Usuário cadastrado com sucesso.",
            id: registerUser.lastInsertRowid
        }
    }

    async login(user: string, password: string) {
        const data = await this.sql.loginUser(user, password)

        if (!data?.id) {
            return {
                success: false,
                msg: "Usuário ou senha inválidos."
            }
        }

        return {
            success: true,
            msg: "Login realizado com sucesso.",
            user: data
        }
    }
}

export default Ctrl