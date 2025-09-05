import Header from "../../shared/Header/Header.jsx";
import classes from "./PackageInfo.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { config } from "../../very secret files/config.js";
import axios from "axios";

const API = config.server;

export default function PackageInfo() {
  let { id } = useParams();
  const [status, setStatus] = useState("Оформлен");
  const [datacargo, setDatacargo] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCargoInfo = () => {
      axios
        .get(`${API}/php/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          setDatacargo(res.data);
          setLoading(true);
          setDatacargo({
            "Вес посылки, кг": res.data.cargos[0].weight,
            "Тип посылки": res.data.cargos[0].title,
            "Тариф ": res.data.type_delivery,
            "Способ оплаты": "Наличные в пункте приёма заказов",
            "Стоимость ": `${res.data.price} тыс руб`,
            "Дата доставки": res.data.date,
          });
        });
    };

    getCargoInfo();
  }, []);

  let navigate = useNavigate();

  const svg_back = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="22"
      viewBox="0 0 26 22"
      fill="none"
    >
      <path
        d="M10.3333 1.5L1 10.9999M1 10.9999L10.3333 20.4999M1 10.9999H25"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  let orderInfo = {
    "ФИО отправителя": "Иванов Иван Иванович",
    "Вес посылки, кг": "20",
    "Тип посылки": "Кошкожены",
    "Тариф ": "Экспресс",
    "Способ оплаты": "Наличные в пункте приёма заказов",
    "Стоимость ": "193 000 тыс руб",
    "Дата доставки": "5 сентября 2025",
  };

  if (datacargo.length > 0) {
    orderInfo = {
      "ФИО отправителя": "Иванов Иван Иванович",
      "Вес посылки, кг": datacargo.cargo[0].weight,
      "Тип посылки": "Кошкожены",
      "Тариф ": "Экспресс",
      "Способ оплаты": "Наличные в пункте приёма заказов",
      "Стоимость ": "193 000 тыс руб",
      "Дата доставки": "5 сентября 2025",
    };
  }

  switch (status) {
    case "В пути":
      orderInfo["Расстояние, км"] = "2 000";
      orderInfo["Скорость, м/с "] = "300";
  }

  return (
    <>
      <Header />
      <div className={classes.PackageInfo}>
        <p className={classes.title}>
          <p
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigate("/profile");
            }}
          >
            {svg_back}
          </p>{" "}
          Посылка №{id}
        </p>
        <div className={classes.info}>
          <div className={classes.infoRow}>
            <p className={classes.infoLabel}>Статус</p>
            <p className={classes.infoStatus}>{status}</p>
          </div>
          {loading && (
            <>
              {Object.entries(datacargo).map(([key, value]) => (
                <div key={key} className={classes.infoRow}>
                  <p className={classes.infoLabel}>{key}</p>
                  <p className={classes.infoValue}>{value}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
