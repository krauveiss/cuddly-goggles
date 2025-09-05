import { useState, useRef, useEffect } from "react";
import classes from "./AdminHeader.module.css";

// Компонент для SVG иконок
const NavItem = ({ name, icon, isActive, onClick }) => {
  return (
    <div className={classes.navItemContainer} onClick={onClick}>
      <img src={`/icons/${icon}.svg`} alt={name} className={classes.navIcon} />
      <p className={isActive ? classes.choosen : ""}>{name}</p>
    </div>
  );
};

export default function AdminHeader() {
  const [activeItem, setActiveItem] = useState("Дашборд");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const itemsRef = useRef({});
  const navRef = useRef(null);

  // Массив пунктов меню с именами иконок
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
        {/* Индикатор активного элемента */}
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
}
