export interface iRegisterParam {
    name: string
    user: string
    password: string
}

export interface iRegisterResponse {
    success: boolean,
    msg: string,
    id: number
}

export interface iLoginResponse {
    success: boolean,
    msg: string,
    user: {
        id: number,
        name: string,
        user: string,
        password: string
    }
}

export interface iGetMateriasResponse {
    id: string,
    nome: string,
    semana: number,
    id_user: string,
    faltas: iFalta[]
}

export interface iFalta {
    id: string,
    indice: number,
    active: boolean
}