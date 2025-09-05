import classes from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import { CheckToken } from "./CheckToken.jsx";
import { useEffect, useState } from "react";
import { config } from "../../very secret files/config.js";
import axios from "axios";

const API = config.server;

export default function Header({ name }) {
  const [info, setInfo] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await axios
        .post(
          `${API}/php/api/me`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        )
        .then((data) => {
          setInfo(data.data);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchData();
  }, []);

  const Logout = () => {
    axios.post(
      `${API}/php/api/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      },
    );

    localStorage.removeItem("access_token");

    navigate("/login");
  };

  let navigate = useNavigate();

  return (
    <header className={classes.header}>
      <p
        onClick={() => {
          navigate("/");
        }}
        className={classes.title}
      >
        Космический <br /> лифт
      </p>

      <nav>
        <p
          onClick={() => {
            navigate("/");
          }}
        >
          Главная
        </p>
        <p
          onClick={() => {
            navigate("/packages");
          }}
        >
          Посылка
        </p>
        <p
          onClick={() => {
            if (CheckToken) {
              navigate("/profile");
            } else {
              navigate("/login");
            }
          }}
        >
          Профиль
        </p>
      </nav>

      {localStorage.getItem("access_token") ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          {info.name} <p onClick={Logout}>Выйти</p>{" "}
        </div>
      ) : (
        <div className={classes.auth}>
          <button
            onClick={() => {
              navigate("/register");
            }}
            className={classes.register}
          >
            Регистрация
          </button>
          <button
            onClick={() => {
              navigate("/login");
            }}
            className={classes.login}
          >
            Войти
          </button>
        </div>
      )}
    </header>
  );
}
