export interface iRegisterParam {
    name: string
    user: string
    password: string
}

export interface iRegisterResponse {
    success: boolean,
    msg: string,
    id: string
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

export interface iMaterias {
    id: string,
    nome: string,
    semana: number,
    faltas: iFalta[]
}

export interface iMateriaToEdit extends iMaterias {
    faltas_active: number
}

export type iGetMateriasResponse = iMaterias

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

export interface iDeleteMateriaResponse {
    success: boolean,
    msg: string
}

export interface iEditMateriaResponse {
    success: boolean,
    msg: string
}

export interface iEditMateriaParam {
    id_materia: string,
    nome: string,
    semana: number,
    faltas: number,
    faltas_active: number
}

export interface iActiveFaltaParam {
    id_materia: string,
    indice: number,
    active: boolean
}

export interface iActiveFaltaResponse {
    success: boolean,
    msg: string
}

export interface iEditUserParam {
    id_user: string,
    name: string,
    user: string,
    alterarSenha: boolean,
    senha: string,
    newSenha: string
}

export interface iEditUserResponse {
    success: boolean,
    msg: string
}