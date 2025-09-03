import classes from "./Header.module.css";

export default function Header() {
    return (
        <header className={classes.header}>

            <p className={classes.title}>
                Космический <br/> лифт
            </p>

            <nav>
                <p>Главная</p>
                <p>Посылка</p>
                <p>Профиль</p>
            </nav>

            <div className={classes.auth}>
                <button className={classes.register} >Регистрация</button>
                <button className={classes.login} >Войти</button>
            </div>
        </header>
    )
}