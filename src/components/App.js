import React from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import {CurrentUserContext} from "../contexts/CurrentUserContext";
import {LoggedInContext} from "../contexts/LoggedInContext";
import {api} from "../utils/api";
import {authorize, getContent, register} from '../utils/mestoAuth'
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import Register from "./Register";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";


function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
    const [loggedIn, setIsLoggedIn] = React.useState(false);
    const [registered, setRegistered] = React.useState(false);
    const [selectedCard, setSelectedCard] = React.useState({});
    const [currentUser, setCurrentUser] = React.useState({});
    const [cards, setCards] = React.useState([]);
    const history = useHistory();


    React.useEffect(() => {
        api.getUserInfo().then((data) => {
            setCurrentUser(data);
        })
            .catch((err) => {
                console.log(err);
            });

        api.getCardsInfo().then((data) => {
            setCards(data);
        })
            .catch((err) => {
                console.log(err);
            });

        tokenCheck();

        if (loggedIn) {
            history.push('/')
        }

    }, [])

    function handleCardLike(card) {
        const isLiked = card.likes.some(i => i._id === currentUser._id);

        api.changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    function handleCardDelete(id){
        api.deleteCard(id)
            .then(() => {
                setCards((cards) => cards.filter((c) => c._id !== id));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(true);
    }

    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true);
    }

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    }

    function closeAllPopups() {
        setIsEditAvatarPopupOpen(false);
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setSelectedCard({});
    }

    function handleUpdateUser(newData) {
        api.changeUserInfo(newData).then((data) => {
            setCurrentUser(data);
            closeAllPopups();
        })
            .catch((err) => {
                console.log(err);
            });
    }

    function handleUpdateAvatar(newData) {
        api.changeAvatar(newData).then((data) => {
            setCurrentUser(data);
            closeAllPopups();
        })
            .catch((err) => {
                console.log(err);
            });
    }

    function handleAddPlaceSubmit(data) {
        api.addCard(data).then((newCard) => {
            setCards([newCard, ...cards]);
            closeAllPopups();
        })
            .catch((err) => {
                console.log(err);
            });
    }

    /* Функция проверки токена */
    function tokenCheck() {
        const jwt = localStorage.getItem('jwt');

        if (jwt){
            getContent(jwt).then((res) => {
                if (res) {
                    setIsLoggedIn(true);
                }
            })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    /* Обработка регистрации */
    function handleRegister({password, email}) {
        register(password, email).then((res) => {
            if (res) {
                setRegistered(true);
                history.push('/sign-in')
            }
        })
            .catch((err) => {
                setRegistered(false);
                console.log(err);
            })
    }

    /* Обработка входа */
    function handleLogin({password, email}) {
        authorize(password, email).then((res) => {
            if (res) {
                setIsLoggedIn(true);
                localStorage.setItem("jwt", res);
            }
        })
            .catch((err) => {
                setIsLoggedIn(false);
                console.log(err);
            })
    }



    return (
       <CurrentUserContext.Provider value={currentUser}>
           <LoggedInContext.Provider value={loggedIn}>
           <div className="App">
               <Header />

               <Switch>
                   <ProtectedRoute
                       exact path = '/'
                       component={Main}
                       onEditAvatar = {handleEditAvatarClick}
                       onEditProfile = {handleEditProfileClick}
                       onAddPlace = {handleAddPlaceClick}
                       onCardClick = {handleCardClick}
                       cards = {cards}
                       onCardLike = {handleCardLike}
                       onCardDelete = {handleCardDelete}
                   />

                   <Route path='/sign-up'>
                       <Register
                           onSubmit={handleRegister}
                       />
                   </Route>

                   <Route path='/sign-in'>
                       <Login
                           onSubmit={handleLogin}
                       />
                   </Route>

                   <Route>
                       {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
                   </Route>
               </Switch>

               <Footer />

               <EditProfilePopup
                   isOpen = {isEditProfilePopupOpen}
                   onClose = {closeAllPopups}
                   onUpdateUser = {handleUpdateUser}
               />

               <AddPlacePopup
                   isOpen = {isAddPlacePopupOpen}
                   onClose = {closeAllPopups}
                   onAddPlace = {handleAddPlaceSubmit}
               />

               <EditAvatarPopup
                   isOpen = {isEditAvatarPopupOpen}
                   onClose = {closeAllPopups}
                   onUpdateAvatar = {handleUpdateAvatar}
               />

               <ImagePopup
                   card = {selectedCard}
                   onClose = {closeAllPopups}
               />
           </div>
           </LoggedInContext.Provider>
       </CurrentUserContext.Provider>
  );
}

export default App;
