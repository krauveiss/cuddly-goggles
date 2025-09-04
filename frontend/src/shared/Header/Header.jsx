import classes from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import { CheckToken } from "./CheckToken.jsx";

export default function Header() {
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
        <p>Главная</p>
        <p>Посылка</p>
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
    </header>
  );
}
