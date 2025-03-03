import { iGetUserByUserResponse, iLoginUserResponse, iRegisterUserParam, iRegisterUserResponse } from "./interfaces";

class Sql {
    constructor(private conexao: any) { }

    getUserByUser(user: string): Promise<iGetUserByUserResponse> {
        const sql = `SELECT id FROM users WHERE user = ?`

        return this.conexao.prepare(sql).get(user)
    }

    registerUser(param: iRegisterUserParam): Promise<iRegisterUserResponse> {
        const sql = `INSERT INTO users (name, user, password) VALUES (?, ?, ?)`

        return this.conexao.prepare(sql).run(param.name, param.user, param.password)
    }

    loginUser(user: string, password: string): Promise<iLoginUserResponse> {
        const sql = `SELECT id, name, user, password FROM users WHERE user = ? AND password = ?`
        return this.conexao.prepare(sql).get(user, password)
    }
}

export default Sql;