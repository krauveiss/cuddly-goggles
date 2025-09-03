import classes from "./General.module.css";
import { useState } from "react";

import { config } from "../../very secret files/config.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = config.server;

export default function Login() {
  let navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const changeInfo = (name, data) => {
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: data,
    }));
  };

  const Auth = () => {
    axios
      .post(`${API}/php/api/login`, userInfo, {
        headers: {
          contentType: "application/json",
        },
      })
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("token", res.data.access_token);
        navigate("/");
      });
  };

  return (
    <div className={classes.Form}>
      <input
        value={userInfo.email}
        onChange={(e) => {
          changeInfo("email", e.target.value);
        }}
        type="text"
      />
      <input
        value={userInfo.password}
        onChange={(e) => {
          changeInfo("password", e.target.value);
        }}
        type="text"
      />
      <button onClick={Auth}>Логин</button>
    </div>
  );
}
