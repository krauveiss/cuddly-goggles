import classes from "./General.module.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { config } from "../../very secret files/config.js";
import Header from "../../shared/Header/Header.jsx";
import { CheckValidateForm } from "./CheckValidateForm.jsx";

const API = config.server;

export default function Register() {
  let navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
  });

  const [Error, setError] = useState([]);

  const changeInfo = (name, data) => {
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: data,
    }));
  };

  const Register = () => {
    console.log(userInfo);
    const Errors = CheckValidateForm(userInfo);
    if (Errors[0]) {
      axios
        .post(`${API}/php/api/register`, userInfo)
        .then((res) => {
          console.log(res);
          localStorage.setItem("token", res.data.access_token);
          navigate("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(Errors[1]);
      setError(Errors[1]);
    }
  };

  return (
    <div className={classes.Auth}>
      <Header />

      <div className={classes.Form}>
        <p className={classes.title}>Регистрация</p>

        <div className={classes.inputs}>
          <p>Email</p>
          <input
            value={userInfo.email}
            onChange={(e) => {
              changeInfo("email", e.target.value);
            }}
            type="email"
          />
        </div>

        <div className={classes.inputs}>
          <p>Придумайте имя пользователя</p>
          <input
            value={userInfo.name}
            onChange={(e) => {
              changeInfo("name", e.target.value);
            }}
            type="text"
          />
        </div>
        <div className={classes.inputs}>
          <p>Придумайте пароль</p>
          <input
            value={userInfo.password}
            onChange={(e) => {
              changeInfo("password", e.target.value);
            }}
            type="password"
          />
        </div>

        <div className={classes.inputs}>
          <p>Повторите пароль</p>
          <input
            value={userInfo.password_confirmation}
            onChange={(e) => {
              changeInfo("password_confirmation", e.target.value);
            }}
            type="password"
          />
        </div>
        <div className={classes.error}>
          {Error.map((item) => (
            <p> - {item} </p>
          ))}{" "}
        </div>
        <button onClick={Register}>Регистрация</button>
        <div className={classes.account}>
          Уже есть аккаунт?{" "}
          <p onClick={() => navigate("/login")} className={classes.enter}>
            Войти
          </p>
        </div>
      </div>
    </div>
  );
}
