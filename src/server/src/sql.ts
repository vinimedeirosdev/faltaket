class Sql {
    constructor(private conexao: any) { }

    getUserByUser(user: string) {
        const sql = `SELECT * FROM users WHERE user = ?`

        return this.conexao.prepare(sql).get(user)
    }
}

export default Sql;