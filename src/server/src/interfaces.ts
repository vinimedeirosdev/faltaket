export interface iGetUserByUserResponse {
    id: number
}

export interface iRegisterUserParam {
    name: string,
    user: string,
    password: string
}

export interface iRegisterUserResponse {
    lastInsertRowid: number
}

export interface iLoginUserResponse {
    user: string,
    password: string,
    name: string,
    id: number
}