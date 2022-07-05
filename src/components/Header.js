import React from 'react';
import logo from "../images/logo.svg";
import {Link, Route} from "react-router-dom";

function Header ({email, onSignOut}) {
    return (
        <header className="header">
            <img className="header__logo"
                 src={logo}
                 alt="Логотип"
            />
            <Route exact path="/">
                <div className="header__user-container">
                    <p className="header__email">{email}</p>
                    <button className="header__button" onClick={onSignOut}>
                        Выйти
                    </button>
                </div>
            </Route>
            <Route path="/sign-in">
                <Link to="/sign-up" className="header__link">
                    Регистрация
                </Link>
            </Route>
            <Route path="/sign-up">
                <Link to="/sign-in" className="header__link">
                    Войти
                </Link>
            </Route>
        </header>
    );
}

export default Header;