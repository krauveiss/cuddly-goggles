import Header from "../../shared/Header/Header.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./User.module.css";

export default function User() {
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }
  }, []);

  return (
    <>
      <Header />
      <div className={classes.Profile}>
        <p className={classes.title}>Профиль</p>

        <div className={classes.personal_info}>
          <div className={classes.info}>
            <p className={classes.info_title}>Email</p>
            <input placeholder={"2@yandex.ru"} type="text" />
          </div>

          <div className={classes.info}>
            <p>Имя пользователя</p>
            <input placeholder={"sexist228"} type="text" />
          </div>

          <div className={classes.info}>
            <p>Код из Telegram</p>
            <input placeholder={"2@yandex.ru"} type="text" />
          </div>
        </div>
      </div>

      <div className={classes.Personal_packages}>
        <p className={classes.title}>Мои поссылки</p>
        <div className={classes.packages}>
          <Package onClick={() => navigate(`/packages/${1}`)} />
          <Package />
          <Package />
          <Package />
        </div>
      </div>
    </>
  );
}

const Package = () => {
  return (
    <div className={classes.Package}>
      <div className={classes.statusPackage}>
        <p className={classes.status}>Оформлен</p>
        <p className={classes.type}>Стандарт</p>
      </div>
      <p className={classes.id}>5432</p>
      <p className={classes.date}>3 сентября 2025</p>
    </div>
  );
};
