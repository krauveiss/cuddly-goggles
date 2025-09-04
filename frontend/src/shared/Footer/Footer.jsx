import classes from "./Footer.module.css";
import { CheckToken } from "../Header/CheckToken.jsx";

export default function Footer() {
  return (
    <div className={classes.Footer}>
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
    </div>
  );
}
