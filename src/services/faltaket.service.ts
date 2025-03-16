import axios from "axios"
import { iLoginResponse, iRegisterParam, iRegisterResponse } from "../interfaces";
const baseURL = `https://faltaket-server.onrender.com`;

type iLoginFunction = (user: string, password: string) => Promise<iLoginResponse>
type iRegisterFunction = (param: iRegisterParam) => Promise<iRegisterResponse>

const login: iLoginFunction = async (user, password) => {
    const { data } = await axios.post(baseURL + "/login", {
        user,
        password
    })

    return data
}

const register: iRegisterFunction = async (param) => {
    const { data } = await axios.post(baseURL + "/register", {
        ...param
    })

    return data
}

export default {
    register,
    login
}