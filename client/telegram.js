// ==========================================
// Zoryx Telegram WebApp
// client/telegram.js
// ==========================================


const tg = window.Telegram.WebApp;


// Initialize

tg.ready();

tg.expand();



// Theme

document.body.style.background =
    tg.themeParams.bg_color ||
    "#0b0b0f";



// User

const telegramUser =
    tg.initDataUnsafe?.user || null;




window.TelegramApp = {


    tg,


    user: telegramUser,


    initData: tg.initData || "",



    isTelegram(){

        return !!telegramUser;

    },



    getUser(){

        return this.user;

    },



    getUserId(){

        return telegramUser?.id || null;

    },



    getUsername(){

        return telegramUser?.username || "";

    },



    getFirstName(){

        return telegramUser?.first_name || "User";

    },



    getLastName(){

        return telegramUser?.last_name || "";

    },



    getPhoto(){

        return telegramUser?.photo_url || "";

    },



    haptic(type="light"){

        try{

            tg.HapticFeedback
              .impactOccurred(type);

        }catch(e){}

    },



    popup(title,message){

        try{

            tg.showPopup({

                title,

                message,

                buttons:[
                    {
                        type:"ok"
                    }
                ]

            });

        }catch(e){

            alert(message);

        }

    },



    alert(message){

        try{

            tg.showAlert(message);

        }catch(e){

            alert(message);

        }

    },


    close(){

        tg.close();

    }


};




console.log(
    "Telegram InitData:",
    tg.initData
);


console.log(
    "Telegram User:",
    window.TelegramApp.user
);
