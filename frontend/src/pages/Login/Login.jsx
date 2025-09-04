import classes from "./General.module.css";
import { useState } from "react";

import { config } from "../../very secret files/config.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../shared/Header/Header.jsx";
import { CheckValidateForm } from "./CheckValidateForm.jsx";

const API = config.server;

export default function Login() {
  let navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const [Error, setError] = useState([]);

  const changeInfo = (name, data) => {
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: data,
    }));
  };

  const Auth = () => {
    const Errors = CheckValidateForm(userInfo);

    if (Errors[0]) {
      axios
        .post(`${API}/php/api/login`, userInfo, {
          headers: {
            contentType: "application/json",
          },
        })
        .then((res) => {
          console.log(res.data);
          localStorage.setItem("access_token", res.data.access_token);
          navigate("/profile");
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
        <p className={classes.title}>Авторизация</p>

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
          <p>Пароль</p>
          <input
            value={userInfo.password}
            onChange={(e) => {
              changeInfo("password", e.target.value);
            }}
            type="password"
          />
        </div>
        <div className={classes.error}>
          {Error.map((item) => (
            <p> - {item} </p>
          ))}{" "}
        </div>
        <button onClick={Auth}>Войти</button>
        <div className={classes.account}>
          Ещё нет аккаунта?{" "}
          <p onClick={() => navigate("/register")} className={classes.enter}>
            Регистрация
          </p>
        </div>
      </div>
    </div>
  );
}
