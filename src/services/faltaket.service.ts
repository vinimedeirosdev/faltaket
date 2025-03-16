import axios from "axios"
import { iGetMateriasResponse, iLoginResponse, iRegisterParam, iRegisterResponse } from "../interfaces";
const baseURL = `https://faltaket-server.onrender.com`;
// baseURL = `http://localhost:3000`;

type iLoginFunction = (user: string, password: string) => Promise<iLoginResponse>
type iRegisterFunction = (param: iRegisterParam) => Promise<iRegisterResponse>
type iGetMateriasFunction = (id_user: string) => Promise<iGetMateriasResponse[]>

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

const getMaterias: iGetMateriasFunction = async (id_user) => {
    const { data } = await axios.post(baseURL + "/getMaterias", {
        id_user
    })

    return data
}

export default {
    register,
    login,
    getMaterias
}