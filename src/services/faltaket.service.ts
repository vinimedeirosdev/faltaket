import axios from "axios"
import {
    iAddMateriaParam, iAddMateriaResponse, iDeleteMateriaResponse, iEditMateriaParam, iEditMateriaResponse,
    iGetMateriasResponse, iLoginResponse, iRegisterParam, iRegisterResponse
} from "../interfaces";

// eslint-disable-next-line prefer-const
let baseURL = `https://faltaket-server.onrender.com`;
// baseURL = `http://localhost:3000`;

type iLoginFunction = (user: string, password: string) => Promise<iLoginResponse>
type iRegisterFunction = (param: iRegisterParam) => Promise<iRegisterResponse>
type iGetMateriasFunction = (id_user: string) => Promise<iGetMateriasResponse[]>
type iAddMateriaFunction = (param: iAddMateriaParam) => Promise<iAddMateriaResponse>
type iDeleteMateriaFunction = (id_materia: string) => Promise<iDeleteMateriaResponse>
type iEditMateriaFunction = (param: iEditMateriaParam) => Promise<iEditMateriaResponse>

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

const deleteMateria: iDeleteMateriaFunction = async (id_materia) => {
    const { data } = await axios.post(baseURL + "/deleteMateria", {
        id_materia
    })
    return data
}

const editMateria: iEditMateriaFunction = async (param) => {
    const { data } = await axios.post(baseURL + "/editMateria", {
        ...param
    })

    return data
}

export default {
    register,
    login,
    getMaterias,
    addMateria,
    deleteMateria,
    editMateria
}