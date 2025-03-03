import Sql from "./sql"

class Ctrl {
    private sql: Sql

    constructor(conexao: any) {
        this.sql = new Sql(conexao)
    }

    async register(param) {
        const userExists = await this.sql.getUserByUser(param.user)

        if (userExists?.id) {
            return {
                success: false,
                message: "Usuário já existe."
            }
        }


    }
}

export default Ctrl