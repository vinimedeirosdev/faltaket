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