import Header from "../../shared/Header/Header.jsx";
import classes from "./Packages.module.css";
import { Prices } from "./Prices.js";
import { useState } from "react";
import axios from "axios";
import { config } from "../../very secret files/config.js";
import { useNavigate } from "react-router-dom";

const API = config.server;

export default function Packages() {
  const [selectedPayment, setSelectedPayment] = useState("");

  const [dInfo, setDInfo] = useState({
    name: "",
    weight: 0,
    type: "",
    delivery: "",
    price: 0,
  });

  const ChangedInfo = (name, data) => {
    setDInfo((prevState) => ({
      ...prevState,
      [name]: data,
    }));
  };

  let navigate = useNavigate();

  const CreateOrder = () => {
    const date = new Date();
    const orderInfos = {
      date_delivery: `${date.getDay()}.${date.getMonth() + 1}.${date.getFullYear()}`,
      type_delivery: dInfo.delivery,
      title: dInfo.type,
      cargos: [
        {
          title: dInfo.type,
          weight: dInfo.weight,
          size: "small",
          type: dInfo.delivery,
        },
      ],
    };

    console.log(orderInfos);

    axios
      .post(`${API}/php/api/orders`, orderInfos, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        navigate(`/order/${res.data.id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <Header />

      <div className={classes.Packages}>
        <p className={classes.maintitle}>Новая посылка</p>
        <div className={classes.Packages1}>
          <div className={classes.left}>
            <div className={classes.form}>
              <div className={classes.inputs}>
                <p className={classes.title}>ФИО отправителя</p>
                <input
                  value={dInfo.name}
                  onChange={(e) => {
                    ChangedInfo("name", e.target.value);
                  }}
                  type="text"
                />
              </div>

              <div className={classes.inputs}>
                <p className={classes.title}>Вес посылки, кг</p>
                <input
                  value={dInfo.weight}
                  onChange={(e) => {
                    ChangedInfo("weight", e.target.value);
                  }}
                  type="number"
                />
              </div>

              <div className={classes.inputs}>
                <p className={classes.title}>
                  Тип посылки (например, ядерные отходы)
                </p>
                <input
                  value={dInfo.type}
                  onChange={(e) => {
                    ChangedInfo("type", e.target.value);
                  }}
                  type="text"
                />
              </div>
            </div>

            <div className={classes.prices}>
              {Prices.map((item) => (
                <PricesPreview ChangedInfo={ChangedInfo} data={item} />
              ))}
            </div>
            <p>Способ оплаты</p>
            <div className={classes.payment}>
              <div
                className={classes.pay}
                onClick={() => setSelectedPayment("cash")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedPayment === "cash"}
                  onChange={() => setSelectedPayment("cash")}
                />
                <p>Наличные в пункте приёма заказа</p>
              </div>

              <div
                className={classes.pay}
                onClick={() => setSelectedPayment("card")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedPayment === "card"}
                  onChange={() => setSelectedPayment("card")}
                />
                <p>Картой в пункте приема заказов</p>
              </div>

              <div
                className={classes.pay}
                onClick={() => setSelectedPayment("crypto")}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedPayment === "crypto"}
                  onChange={() => setSelectedPayment("crypto")}
                />
                <p>Криптовалюта</p>
              </div>
            </div>
          </div>

          <div className={classes.right}>
            <div className={classes.order}>
              <p className={classes.title}>Стоимость заказа</p>
              <p className={classes.description}>
                {dInfo.weight > 0 && dInfo.delivery.length > 0 ? (
                  <OrderPreview prices={Prices} dInfo={dInfo} />
                ) : (
                  `Цена будет расчитана после указания веса посылки и тарифа`
                )}
              </p>
              <button onClick={CreateOrder} className={classes.btnOrder}>
                Оформить посылку
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PricesPreview = ({ ChangedInfo, data }) => {
  return (
    <div
      onClick={() => {
        ChangedInfo("delivery", data.name);
        ChangedInfo("price", data.price);
      }}
      className={classes.PricePreview}
    >
      <p className={classes.Price_title}>{data.name}</p>
      <p className={classes.Price_duration}>{data.duration}</p>
      <p className={classes.Price_payment}>{data.price} тыс. руб за кг</p>
    </div>
  );
};

const OrderPreview = ({ prices, dInfo }) => {
  console.log(prices, dInfo);

  const cost = dInfo.price * dInfo.weight;
  const service_cost = 18_000;

  return (
    <>
      <div className={classes.cost}>
        <p>Доставка</p>
        <p className={classes.price}>{cost} тыс</p>
      </div>
      <div className={classes.cost}>
        <p>Сервисный сбор</p>
        <p className={classes.price}>{service_cost} тыс</p>
      </div>
      <div className={classes.cost}>
        <p
          style={{
            fontFamily: "'Unbounded', sans-serif",
          }}
        >
          ИТОГО
        </p>
        <p className={classes.price}>{cost + service_cost} тыс</p>
      </div>
    </>
  );
};
