import classes from './General.module.css'
import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {config} from "../../very secret files/config.js";

const API = config.server

export default function Register() {

    let navigate = useNavigate();

    const [userInfo, setUserInfo] = useState({
        email: "",
        password: "",
        password_confirmation: "",
        name: "",
    })

    const changeInfo = (name, data) => {
        setUserInfo(prevState => ({
            ...prevState,
            [name]: data,
        }))
    }

    const Register = () => {
        console.log(userInfo)
        axios.post(`${API}/php/api/register`, userInfo)
            .then(res => {
            console.log(res)
            localStorage.setItem("token", res.data.access_token)
            navigate("/login")
        })
        .catch(err => {
            console.log(err)})
    }

    return (
        <div className={classes.Form}>
            <p>register</p>
            <input placeholder="email" value={userInfo.email} onChange={(e) => {
                changeInfo("email", e.target.value)
            }} type="email"/>
            <input value={userInfo.name} onChange={(e) => {
                changeInfo("name", e.target.value)
            }} type="text"/>
            <input value={userInfo.password} onChange={(e) => {
                changeInfo("password", e.target.value)
            }} type="password"/>
            <input value={userInfo.password_confirmation} onChange={(e) => {
                changeInfo("password_confirmation", e.target.value)
            }} type="password"/>
            <button onClick={Register} >регистрация</button>
        </div>


    )
}