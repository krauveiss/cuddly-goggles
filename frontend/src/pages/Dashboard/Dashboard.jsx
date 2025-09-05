import { useState, useRef, useEffect, useMemo } from "react";
import classes from "./Dashboard.module.css";
import { config } from "../../very secret files/config.js";

const API = config.server;

// Компоненты для каждого раздела
const DashboardContent = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOrders: 0,
    activeWorkers: 0,
    elevatorStatus: "pending",
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, ordersResponse, elevatorResponse] =
        await Promise.all([
          axios.get(`${API}/dotnet/api/admin/users`),
          axios.get(`${API}/dotnet/api/admin/orders`),
          axios.get(`${API}/dotnet/api/admin/elevator`),
        ]);

      const users = usersResponse.data;
      const orders = ordersResponse.data;
      const elevator = elevatorResponse.data;

      const activeWorkers = users.filter(
        (user) => user.role === "worker",
      ).length;

      const recentOrders = orders
        .sort(
          (a, b) =>
            new Date(b.cargos?.[0]?.createdAt || b.createdAt) -
            new Date(a.cargos?.[0]?.createdAt || a.createdAt),
        )
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        activeOrders: orders.filter(
          (order) =>
            order.status === "in_progress" || order.status === "pending",
        ).length,
        activeWorkers,
        elevatorStatus: elevator.status,
        recentOrders,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Произошла ошибка";
      setError(errorMessage);
      console.error("Ошибка при загрузке данных:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      pending: "Ожидание",
      in_progress: "В движении",
      delivered: "Доставлен",
      canceled: "Отменен",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ffc107",
      in_progress: "#17a2b8",
      delivered: "#28a745",
      canceled: "#dc3545",
    };
    return colorMap[status] || "#6c757d";
  };

  if (loading) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Дашборд</h2>
          <button
            onClick={fetchDashboardData}
            className={classes.refreshButton}
            disabled
          >
            Обновить
          </button>
        </div>
        <div className={classes.loading}>
          <div className={classes.spinner}></div>
          Загрузка данных...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Дашборд</h2>
          <button
            onClick={fetchDashboardData}
            className={classes.refreshButton}
          >
            Обновить
          </button>
        </div>
        <div className={classes.error}>
          <div className={classes.errorIcon}>⚠️</div>
          <p>Ошибка при загрузке: {error}</p>
          <button onClick={fetchDashboardData} className={classes.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.content}>
      <div className={classes.sectionHeader}>
        <h2>Дашборд</h2>
        <button onClick={fetchDashboardData} className={classes.refreshButton}>
          Обновить
        </button>
      </div>

      <div className={classes.dashboardGrid}>
        <div className={classes.statsSection}>
          <h3>Ключевые метрики</h3>
          <div className={classes.stats}>
            <div className={classes.statCard}>
              <div className={classes.statInfo}>
                <div className={classes.statNumber}>{stats.totalUsers}</div>
                <div className={classes.statLabel}>Всего пользователей</div>
              </div>
            </div>

            <div className={classes.statCard}>
              <div className={classes.statInfo}>
                <div className={classes.statNumber}>{stats.activeOrders}</div>
                <div className={classes.statLabel}>Активных заказов</div>
              </div>
            </div>

            <div className={classes.statCard}>
              <div className={classes.statInfo}>
                <div className={classes.statNumber}>{stats.activeWorkers}</div>
                <div className={classes.statLabel}>Активных работников</div>
              </div>
            </div>

            <div className={classes.statCard}>
              <div className={classes.statInfo}>
                <div
                  className={classes.statNumber}
                  style={{ color: getStatusColor(stats.elevatorStatus) }}
                >
                  {formatStatus(stats.elevatorStatus)}
                </div>
                <div className={classes.statLabel}>Статус лифта</div>
              </div>
            </div>
          </div>
        </div>

        <div className={classes.recentOrdersSection}>
          <h3>Последние заказы</h3>
          <div className={classes.ordersList}>
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className={classes.orderItem}>
                  <div className={classes.orderHeader}>
                    <span className={classes.orderId}>#{order.id}</span>
                    <span
                      className={classes.orderStatus}
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className={classes.orderDetails}>
                    <span className={classes.orderTitle}>
                      {order.cargos?.[0]?.title || "Без названия"}
                    </span>
                    <span className={classes.orderPrice}>{order.price} ₽</span>
                  </div>
                  <div className={classes.orderDate}>
                    {new Date(
                      order.cargos?.[0]?.createdAt || order.createdAt,
                    ).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              ))
            ) : (
              <div className={classes.noOrders}>Нет recentних заказов</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ElevatorContent = () => {
  const [elevatorData, setElevatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchElevatorData();
  }, []);

  const fetchElevatorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API}/dotnet/api/admin/elevator`);
      setElevatorData(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Произошла ошибка";
      setError(errorMessage);
      console.error("Ошибка при загрузке данных лифта:", err);
    } finally {
      setLoading(false);
    }
  };

  const startElevator = async () => {
    try {
      setActionLoading(true);

      const response = await axios.put(
        `${API}/dotnet/api/admin/elevator/start`,
      );

      console.log("Лифт запущен");
      await fetchElevatorData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Ошибка при запуске лифта";
      alert(errorMessage);
      console.error("Ошибка при запуске лифта:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelElevator = async () => {
    try {
      setActionLoading(true);

      const response = await axios.put(
        `${API}/dotnet/api/admin/elevator/cancel`,
      );

      console.log("Лифт остановлен");
      await fetchElevatorData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Ошибка при остановке лифта";
      alert(errorMessage);
      console.error("Ошибка при остановке лифта:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      pending: "Ожидание",
      in_progress: "В движении",
      delivered: "Доставлен",
      canceled: "Отменен",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ffc107",
      in_progress: "#17a2b8",
      delivered: "#28a745",
      canceled: "#dc3545",
    };
    return colorMap[status] || "#6c757d";
  };

  const metersToKilometers = (meters) => {
    return (meters / 1000).toFixed(2);
  };

  if (loading) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Управление лифтом</h2>
          <button
            onClick={fetchElevatorData}
            className={classes.refreshButton}
            disabled
          >
            Обновить
          </button>
        </div>
        <div className={classes.loading}>
          <div className={classes.spinner}></div>
          Загрузка данных лифта...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Управление лифтом</h2>
          <button onClick={fetchElevatorData} className={classes.refreshButton}>
            Обновить
          </button>
        </div>
        <div className={classes.error}>
          <div className={classes.errorIcon}>⚠️</div>
          <p>Ошибка при загрузке: {error}</p>
          <button onClick={fetchElevatorData} className={classes.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.content}>
      <div className={classes.sectionHeader}>
        <h2>Управление лифтом</h2>
        <button onClick={fetchElevatorData} className={classes.refreshButton}>
          Обновить
        </button>
      </div>

      {elevatorData && (
        <div className={classes.elevatorContainer}>
          <div className={classes.elevatorCard}>
            <h3>Текущее состояние лифта</h3>

            <div className={classes.elevatorInfo}>
              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Статус:</span>
                <span
                  className={classes.infoValue}
                  style={{ color: getStatusColor(elevatorData.status) }}
                >
                  {formatStatus(elevatorData.status)}
                </span>
              </div>

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Текущая нагрузка:</span>
                <span className={classes.infoValue}>
                  {elevatorData.workload.toLocaleString()} кг
                </span>
              </div>

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Скорость:</span>
                <span className={classes.infoValue}>
                  {elevatorData.speed} м/с
                </span>
              </div>

              <div className={classes.infoRow}>
                <span className={classes.infoLabel}>Осталось пройти:</span>
                <span className={classes.infoValue}>
                  {metersToKilometers(elevatorData.remainDistance)} км
                </span>
              </div>
            </div>

            <div className={classes.progressContainer}>
              <div className={classes.progressLabel}>
                Пройдено расстояния:{" "}
                {metersToKilometers(500 - elevatorData.remainDistance)}км /{" "}
                {metersToKilometers(500)}км
              </div>
              <div className={classes.progressBar}>
                <div
                  className={classes.progressFill}
                  style={{
                    width: `${((500 - elevatorData.remainDistance) / 500) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className={classes.controls}>
              <button
                onClick={startElevator}
                disabled={
                  actionLoading || elevatorData.status === "in_progress"
                }
                className={classes.controlButton}
              >
                {actionLoading ? (
                  <span className={classes.buttonSpinner}></span>
                ) : (
                  "Запустить лифт"
                )}
              </button>

              <button
                onClick={cancelElevator}
                disabled={
                  actionLoading || elevatorData.status !== "in_progress"
                }
                className={`${classes.controlButton} ${classes.cancelButton}`}
              >
                {actionLoading ? (
                  <span className={classes.buttonSpinner}></span>
                ) : (
                  "Остановить лифт"
                )}
              </button>
            </div>
          </div>

          <div className={classes.statusInfo}>
            <h4>Статусы лифта:</h4>
            <ul className={classes.statusList}>
              <li>
                <span style={{ color: "#ffc107" }}>●</span> Ожидание - лифт
                готов к работе
              </li>
              <li>
                <span style={{ color: "#17a2b8" }}>●</span> В движении - лифт
                выполняет подъем
              </li>
              <li>
                <span style={{ color: "#28a745" }}>●</span> Доставлен - груз
                успешно доставлен
              </li>
              <li>
                <span style={{ color: "#dc3545" }}>●</span> Отменен - операция
                прервана
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для отображения заказов
const OrdersContent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API}/dotnet/api/admin/orders`);
      setOrders(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Произошла ошибка";
      setError(errorMessage);
      console.error("Ошибка при загрузке заказов:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === "none") {
      setSortConfig({ key: null, direction: "asc" });
    } else {
      const [key, direction] = value.split("-");
      setSortConfig({ key, direction });
    }
  };

  const sortedOrders = useMemo(() => {
    if (!sortConfig.key) return orders;

    return [...orders].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "date":
          aValue = new Date(a.cargos?.[0]?.createdAt || a.createdAt);
          bValue = new Date(b.cargos?.[0]?.createdAt || b.createdAt);
          break;
        case "delivery":
          aValue = a.typeDelivery;
          bValue = b.typeDelivery;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [orders, sortConfig]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await axios.put(
        `${API}/dotnet/api/admin/order/${orderId}/status/${newStatus}`,
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      console.log(`Статус заказа ${orderId} изменен на ${newStatus}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Ошибка при изменении статуса";
      alert(errorMessage);
      console.error("Ошибка при изменении статуса:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      pending: "Ожидание",
      in_progress: "В процессе",
      delivered: "Доставлен",
      cancelled: "Отменен",
    };
    return statusMap[status] || status;
  };

  const formatDeliveryType = (type) => {
    const typeMap = {
      SECRET: "Секретная",
      STANDARD: "Стандартная",
      EXPRESS: "Экспресс",
    };
    return typeMap[type] || type;
  };

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      pending: ["in_progress", "cancelled"],
      in_progress: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const getCurrentSortValue = () => {
    if (!sortConfig.key) return "none";
    return `${sortConfig.key}-${sortConfig.direction}`;
  };

  if (loading) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Заказы</h2>
          <button
            onClick={fetchOrders}
            className={classes.refreshButton}
            disabled
          >
            Обновить
          </button>
        </div>
        <div className={classes.loading}>
          <div className={classes.spinner}></div>
          Загрузка заказов...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.content}>
        <div className={classes.sectionHeader}>
          <h2>Заказы</h2>
          <button onClick={fetchOrders} className={classes.refreshButton}>
            Обновить
          </button>
        </div>
        <div className={classes.error}>
          <div className={classes.errorIcon}>⚠️</div>
          <p>Ошибка при загрузке: {error}</p>
          <button onClick={fetchOrders} className={classes.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.content}>
      <div className={classes.sectionHeader}>
        <h2>Заказы</h2>
        <div className={classes.actions}>
          <span className={classes.ordersCount}>Всего: {orders.length}</span>
          <div className={classes.sortContainer}>
            <label htmlFor="sortSelect" className={classes.sortLabel}>
              Сортировка:
            </label>
            <select
              id="sortSelect"
              onChange={handleSortChange}
              value={getCurrentSortValue()}
              className={classes.sortSelect}
            >
              <option value="none">Без сортировки</option>
              <option value="price-asc">Цена (по возрастанию)</option>
              <option value="price-desc">Цена (по убыванию)</option>
              <option value="status-asc">Статус (А-Я)</option>
              <option value="status-desc">Статус (Я-А)</option>
              <option value="delivery-asc">Тип доставки (А-Я)</option>
              <option value="delivery-desc">Тип доставки (Я-А)</option>
              <option value="date-asc">Дата (сначала старые)</option>
              <option value="date-desc">Дата (сначала новые)</option>
            </select>
          </div>
          <button onClick={fetchOrders} className={classes.refreshButton}>
            Обновить
          </button>
        </div>
      </div>

      <div className={classes.tableContainer}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название груза</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Тип доставки</th>
              <th>Цена</th>
              <th>Вес груза</th>
              <th>Дата создания</th>
              <th>Изменение статуса</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => {
                const availableStatuses = getAvailableStatuses(order.status);

                return (
                  <tr key={order.id}>
                    <td className={classes.orderId}>#{order.id}</td>
                    <td className={classes.cargoTitle}>
                      {order.cargos && order.cargos.length > 0
                        ? order.cargos[0].title
                        : "Нет данных"}
                    </td>
                    <td>
                      <span
                        className={`${classes.statusBadge} ${classes[order.status]}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td>{order.date}</td>
                    <td>{formatDeliveryType(order.typeDelivery)}</td>
                    <td className={classes.price}>{order.price} ₽</td>
                    <td>
                      {order.cargos && order.cargos.length > 0
                        ? `${order.cargos[0].weight} г`
                        : "Нет данных"}
                    </td>
                    <td>
                      {order.cargos && order.cargos.length > 0
                        ? new Date(
                            order.cargos[0].createdAt,
                          ).toLocaleDateString("ru-RU")
                        : "Нет данных"}
                    </td>
                    <td>
                      {availableStatuses.length > 0 ? (
                        <select
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          disabled={updatingOrderId === order.id}
                          className={classes.statusSelect}
                          value=""
                        >
                          <option value="">Изменить статус...</option>
                          {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={classes.noStatusChange}>
                          Недоступно
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className={classes.viewButton}
                        onClick={() => console.log("Просмотр заказа", order.id)}
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className={classes.noData}>
                  Заказы не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import axios from "axios";

// Компонент для отображения пользовател

// Компонент для отображения пользователей
const UsersContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

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

  const updateUserRole = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);

      const response = await axios.put(
        `${API}/dotnet/api/admin/users/${userId}/role/${newRole}`,
      );

      // Обновляем данные пользователя после успешного изменения
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );

      console.log(`Роль пользователя ${userId} изменена на ${newRole}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Ошибка при изменении роли";
      alert(errorMessage);
      console.error("Ошибка при изменении роли:", err);
    } finally {
      setUpdatingUserId(null);
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
              <th>Действия</th>
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
                    {user.role !== "worker" ? (
                      <button
                        onClick={() => updateUserRole(user.id, "worker")}
                        disabled={updatingUserId === user.id}
                        className={classes.roleButton}
                        title="Сделать работником"
                      >
                        {updatingUserId === user.id ? (
                          <span className={classes.miniSpinner}></span>
                        ) : (
                          "Сделать работником"
                        )}
                      </button>
                    ) : (
                      <span className={classes.alreadyWorker}>Работник</span>
                    )}
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
                <td colSpan="8" className={classes.noData}>
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

const StaffContent = () => <></>;

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
