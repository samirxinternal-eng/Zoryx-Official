// ==========================================
// Zoryx Telegram WebApp
// client/telegram.js
// ==========================================

const tg = window.Telegram.WebApp;

tg.ready();

tg.expand();

tg.enableClosingConfirmation();

const TelegramApp = {};


// ==========================================
// Theme
// ==========================================

TelegramApp.theme = tg.colorScheme || "dark";

TelegramApp.version = tg.version;

TelegramApp.platform = tg.platform;


// ==========================================
// User
// ==========================================

TelegramApp.user =

tg.initDataUnsafe?.user || null;


// ==========================================
// Init Data
// ==========================================

TelegramApp.getInitData = () => ({

    ...tg.initDataUnsafe,

    initData: tg.initData

});


// ==========================================
// Haptic Feedback
// ==========================================

TelegramApp.haptic =

(type="light")=>{

try{

if(

!tg.HapticFeedback

)

return;

switch(type){

case "light":

tg.HapticFeedback.impactOccurred(

"light"

);

break;

case "medium":

tg.HapticFeedback.impactOccurred(

"medium"

);

break;

case "heavy":

tg.HapticFeedback.impactOccurred(

"heavy"

);

break;

case "success":

tg.HapticFeedback.notificationOccurred(

"success"

);

break;

case "warning":

tg.HapticFeedback.notificationOccurred(

"warning"

);

break;

case "error":

tg.HapticFeedback.notificationOccurred(

"error"

);

break;

}

}
catch(e){}

};


// ==========================================
// Popup
// ==========================================

TelegramApp.popup = (

title,

message

)=>{

const popup =

document.getElementById(

"popup"

);

const overlay =

document.getElementById(

"overlay"

);

if(

popup

){

document.getElementById(

"popupTitle"

).textContent = title;

document.getElementById(

"popupMessage"

).textContent = message;

popup.classList.remove(

"hidden"

);

}

if(

overlay

){

overlay.classList.remove(

"hidden"

);

}

};


// ==========================================
// Close Popup
// ==========================================

TelegramApp.closePopup = ()=>{

const popup =

document.getElementById(

"popup"

);

const overlay =

document.getElementById(

"overlay"

);

if(

popup

){

popup.classList.add(

"hidden"

);

}

if(

overlay

){

overlay.classList.add(

"hidden"

);

}

};


// ==========================================
// Alert
// ==========================================

TelegramApp.alert =

(text)=>{

if(

tg.showAlert

){

tg.showAlert(

text

);

}else{

alert(text);

}

};


// ==========================================
// Confirm
// ==========================================

TelegramApp.confirm =

(text,callback)=>{

if(

tg.showConfirm

){

tg.showConfirm(

text,

callback

);

}else{

callback(

confirm(text)

);

}

};


// ==========================================
// Toast
// ==========================================

TelegramApp.toast =

(message)=>{

const container =

document.getElementById(

"toastContainer"

);

if(

!container

)

return;

const toast =

document.createElement(

"div"

);

toast.className =

"toast";

toast.innerText =

message;

container.appendChild(

toast

);

setTimeout(

()=>{

toast.classList.add(

"show"

);

},50);

setTimeout(

()=>{

toast.classList.remove(

"show"

);

setTimeout(

()=>{

toast.remove();

},300);

},2500);

};


// ==========================================
// Main Button
// ==========================================

TelegramApp.mainButton = {

show(text,callback){

tg.MainButton.setText(

text

);

tg.MainButton.show();

tg.MainButton.offClick();

tg.MainButton.onClick(

callback

);

},

hide(){

tg.MainButton.hide();

}

};


// ==========================================
// Back Button
// ==========================================

TelegramApp.backButton = {

show(callback){

tg.BackButton.show();

tg.BackButton.offClick();

tg.BackButton.onClick(

callback

);

},

hide(){

tg.BackButton.hide();

}

};


// ==========================================
// Export
// ==========================================

window.TelegramApp = TelegramApp;
