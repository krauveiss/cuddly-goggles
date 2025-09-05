import { useState, useRef, useEffect } from "react";
import classes from "./Dashboard.module.css";
import { config } from "../../very secret files/config.js";

const API = config.server;

// Компоненты для каждого раздела
const DashboardContent = () => (
  <div className={classes.content}>
    <h2>Дашборд</h2>
    <p>Здесь отображается общая статистика и аналитика</p>
    <div className={classes.stats}>
      <div className={classes.statCard}>Всего пользователей: 1,243</div>
      <div className={classes.statCard}>Активных заказов: 57</div>
      <div className={classes.statCard}>Выполнено сегодня: 12</div>
    </div>
  </div>
);

const ElevatorContent = () => (
  <div className={classes.content}>
    <h2>Управление лифтом</h2>
    <p>
      Статус лифта: <span className={classes.statusActive}>В работе</span>
    </p>
    <div className={classes.controls}>
      <button className={classes.controlButton}>Запустить</button>
      <button className={classes.controlButton}>Остановить</button>
      <button className={classes.controlButton}>Экстренная остановка</button>
    </div>
  </div>
);

const OrdersContent = () => (
  <div className={classes.content}>
    <h2>Заказы</h2>
    <div className={classes.tableContainer}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Клиент</th>
            <th>Статус</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#12345</td>
            <td>Иван Иванов</td>
            <td>В процессе</td>
            <td>12.05.2023</td>
          </tr>
          <tr>
            <td>#12346</td>
            <td>Петр Петров</td>
            <td>Завершен</td>
            <td>11.05.2023</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

import axios from "axios";

// Компонент для отображения пользователей
const UsersContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API}/dotnet/api/admin/users`);
      setUsers(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Произошла ошибка";
      setError(errorMessage);
      console.error("Ошибка при загрузке пользователей:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Пользователи</h2>
          <button
            onClick={fetchUsers}
            className={classes.refreshButton}
            disabled
          >
            Обновить
          </button>
        </div>
        <div className={classes.loading}>
          <div className={classes.spinner}></div>
          Загрузка пользователей...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Пользователи</h2>
          <button onClick={fetchUsers} className={classes.refreshButton}>
            Обновить
          </button>
        </div>
        <div className={classes.error}>
          <div className={classes.errorIcon}>⚠️</div>
          <p>Ошибка при загрузке: {error}</p>
          <button onClick={fetchUsers} className={classes.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.content}>
      <div className={classes.sectionHeader}>
        <h2>Пользователи</h2>
        <div className={classes.actions}>
          <span className={classes.usersCount}>Всего: {users.length}</span>
          <button onClick={fetchUsers} className={classes.refreshButton}>
            Обновить
          </button>
        </div>
      </div>

      <div className={classes.tableContainer}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Имя пользователя</th>
              <th>ID</th>
              <th>Почта</th>
              <th>TG Token</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Подтвержден</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className={classes.userName}>{user.name}</td>
                  <td className={classes.userId}>#{user.id}</td>
                  <td>{user.email}</td>
                  <td className={classes.tgCell}>{user.tg || "Не указан"}</td>
                  <td>
                    <span
                      className={`${classes.roleBadge} ${classes[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td>
                    {user.emailVerifiedAt ? (
                      <span className={classes.verified}>✓</span>
                    ) : (
                      <span className={classes.notVerified}>✗</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={classes.noData}>
                  Пользователи не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StaffContent = () => (
  <div className={classes.content}>
    <h2>Персонал</h2>
    <div className={classes.staffList}>
      <div className={classes.staffItem}>
        <div className={classes.staffInfo}>
          <h3>Алексей Оператор</h3>
          <p>Оператор лифта</p>
        </div>
        <div className={classes.staffSchedule}>
          <span>Смена: 08:00-20:00</span>
        </div>
      </div>
      <div className={classes.staffItem}>
        <div className={classes.staffInfo}>
          <h3>Елена Техник</h3>
          <p>Технический специалист</p>
        </div>
        <div className={classes.staffSchedule}>
          <span>Смена: 10:00-22:00</span>
        </div>
      </div>
    </div>
  </div>
);

// Компонент для пунктов навигации
const NavItem = ({ name, icon, isActive, onClick }) => {
  return (
    <div className={classes.navItemContainer} onClick={onClick}>
      <img src={`/icons/${icon}.svg`} alt={name} className={classes.navIcon} />
      <p className={isActive ? classes.choosen : ""}>{name}</p>
    </div>
  );
};

// Компонент заголовка
const AdminHeader = ({ activeItem, setActiveItem }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const itemsRef = useRef({});
  const navRef = useRef(null);

  const menuItems = [
    { name: "Дашборд", icon: "dashboard" },
    { name: "Лифт", icon: "elevator" },
    { name: "Заказы", icon: "orders" },
    { name: "Пользователи", icon: "users" },
    { name: "Персонал", icon: "staff" },
  ];

  useEffect(() => {
    updateIndicatorPosition();
  }, []);

  const updateIndicatorPosition = () => {
    if (itemsRef.current[activeItem] && navRef.current) {
      const activeElement = itemsRef.current[activeItem];
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeElement.getBoundingClientRect();

      setIndicatorStyle({
        width: `${itemRect.width}px`,
        height: `${itemRect.height}px`,
        left: `${itemRect.left - navRect.left}px`,
        opacity: 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      });
    }
  };

  useEffect(() => {
    updateIndicatorPosition();

    const handleResize = () => updateIndicatorPosition();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [activeItem]);

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  return (
    <header className={classes.header}>
      <p className={classes.title}>
        Космический <br /> лифт
      </p>

      <nav className={classes.nav} ref={navRef}>
        <span className={classes.indicator} style={indicatorStyle}></span>

        {menuItems.map((item) => (
          <div
            key={item.name}
            ref={(el) => (itemsRef.current[item.name] = el)}
            className={classes.navItemWrapper}
          >
            <NavItem
              name={item.name}
              icon={item.icon}
              isActive={activeItem === item.name}
              onClick={() => handleItemClick(item.name)}
            />
          </div>
        ))}
      </nav>

      <button className={classes.logoutButton}>Выйти</button>
    </header>
  );
};

// Главный компонент Dashboard
export default function Dashboard() {
  const [activeItem, setActiveItem] = useState("Дашборд");

  // Функция для отображения соответствующего контента
  const renderContent = () => {
    switch (activeItem) {
      case "Дашборд":
        return <DashboardContent />;
      case "Лифт":
        return <ElevatorContent />;
      case "Заказы":
        return <OrdersContent />;
      case "Пользователи":
        return <UsersContent />;
      case "Персонал":
        return <StaffContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className={classes.container}>
      <AdminHeader activeItem={activeItem} setActiveItem={setActiveItem} />
      <main className={classes.main}>{renderContent()}</main>
    </div>
  );
}
