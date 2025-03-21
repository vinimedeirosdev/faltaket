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
        id: string,
        name: string,
        user: string,
        password: string
    }
}

export interface iGetMateriasResponse {
    id: string,
    nome: string,
    semana: number,
    faltas: iFalta[]
}

export interface iFalta {
    indice: number,
    active: boolean
}

export interface iPropsAddMateria {
    nome: string,
    semana: number,
    faltas: number,
    id_materia: string
}

export interface iAddMateriaParam {
    id_user: string,
    nome: string,
    semana: number,
    faltas: number
}

export interface iAddMateriaResponse {
    success: boolean,
    msg: string,
    id_materia: string
}