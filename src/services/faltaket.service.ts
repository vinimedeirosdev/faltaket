import axios from "axios"
import { iRegisterParam, iRegisterResponse } from "../interfaces";
const baseURL = `${window.location.protocol}//${window.location.hostname}:5000`;

type iLoginFunction = (user: string, password: string) => Promise<void>
type iRegisterFunction = (param: iRegisterParam) => Promise<iRegisterResponse>

const register: iRegisterFunction = async (param) => {
    const { data } = await axios.post(baseURL + "/register", {
        ...param
    })

    return data
}

export default {
    register
}