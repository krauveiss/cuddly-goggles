import Header from "../../shared/Header/Header.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./User.module.css";
import { config } from "../../very secret files/config.js";
import axios from "axios";

const API = config.server;

export default function User() {
  let navigate = useNavigate();
  const [user, setUser] = useState({});
  const [packages, setPackages] = useState([]);

  const [tg_token, setTg_token] = useState();
  const [tg_token_verified, setTg_token_verified] = useState(false);

  const [load, setLoad] = useState(false);

  const LinkTG = () => {
    if (!tg_token_verified) {
      axios
        .post(
          `${API}/php/api/func/settg`,
          {
            telegram_id: tg_token,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        )
        .then((r) => {
          if (r.data.status === "ok") {
            setTg_token_verified(true);
          }
        })
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }

    const getUserInfo = () => {
      let userId;

      axios
        .post(
          `${API}/php/api/me`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        )
        .then((res) => {
          setUser(res.data);

          if (res.data.tg > 2) {
            setTg_token_verified(true);
            setTg_token(res.data.tg);
          }
        });

      axios
        .get(`${API}/php/api/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })
        .then((res) => {
          setPackages(res.data);
          setLoad(true);
        });
    };

    getUserInfo();
  }, []);

  return (
    <>
      <Header />
      <div className={classes.Profile}>
        <p className={classes.title}>Профиль</p>

        <div className={classes.personal_info}>
          <div className={classes.info}>
            <p className={classes.info_title}>Email</p>
            <input readOnly value={user.email} type="text" />
          </div>

          <div className={classes.info}>
            <p>Имя пользователя</p>
            <input readOnly value={user.name} type="text" />
          </div>

          <div className={classes.info}>
            <p>Код из Telegram</p>
            <input
              onChange={(e) => {
                if (!tg_token_verified) {
                  setTg_token(e.target.value);
                }
              }}
              value={tg_token}
              type="text"
            />
            {!tg_token_verified && (
              <button className={classes.TGBUTTON} onClick={LinkTG}>
                Прикрепить
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={classes.Personal_packages}>
        <p className={classes.title}>Мои поссылки</p>
        {load && (
          <div className={classes.packages}>
            {packages.map((item, index) => (
              <Package data={item} key={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const Package = ({ data }) => {
  let navigate = useNavigate();

  // ['pending', 'in_progress', 'delivered', 'cancelled']

  let status = "";

  switch (data.status) {
    case "pending":
      status = "Оформлен";
      break;
    case "in_progress":
      status = "В процессе";
      break;
    case "delivered":
      status = "Доставлен";
      break;
    case "cancelled":
      status = "Отменён";
      break;
  }

  return (
    <div
      onClick={() => {
        navigate(`/packages/${data.id}`);
      }}
      className={classes.Package}
    >
      <div className={classes.statusPackage}>
        <p className={classes.status}>{status}</p>
        <p className={classes.type}>{data.cargos[0].type}</p>
      </div>
      <p className={classes.id}>{data.id}</p>
      <p className={classes.date}>{data.date}</p>
    </div>
  );
};
