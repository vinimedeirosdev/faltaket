import axios from "axios"
import { iAddMateriaParam, iAddMateriaResponse, iGetMateriasResponse, iLoginResponse, iRegisterParam, iRegisterResponse } from "../interfaces";
const baseURL = `https://faltaket-server.onrender.com`;
// baseURL = `http://localhost:3000`;

type iLoginFunction = (user: string, password: string) => Promise<iLoginResponse>
type iRegisterFunction = (param: iRegisterParam) => Promise<iRegisterResponse>
type iGetMateriasFunction = (id_user: string) => Promise<iGetMateriasResponse[]>
type iAddMateriaFunction = (param: iAddMateriaParam) => Promise<iAddMateriaResponse>
type iDeleteMateriaaFunction = (id_materia: string) => Promise<iDeleteMateriaResponse>

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

const addMateria: iAddMateriaFunction = async (param) => {
    const { data } = await axios.post(baseURL + "/addMateria", {
        ...param
    })

    return data
}

const deleteMateria: iDeleteMateriaaFunction = async (id_materia) => {
    const { data } = await axios.post(baseURL + "/deleteMateria", {
        id_materia
    })
    return data
}

export default {
    register,
    login,
    getMaterias,
    addMateria,
    deleteMateria
}