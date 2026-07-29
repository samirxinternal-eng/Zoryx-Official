// ==========================================
// Zoryx Telegram WebApp
// client/api.js
// ==========================================


const API = {


    BASE_URL: window.location.origin,



    // ======================================
    // Request Handler
    // ======================================

    async request(endpoint, method = "GET", data = null){


        try{


            const options = {

                method,

                headers:{

                    "Content-Type":
                    "application/json"

                }

            };



            if(data){

                options.body =
                JSON.stringify(data);

            }



            const response =
            await fetch(

                `${this.BASE_URL}${endpoint}`,

                options

            );



            const text =
            await response.text();



            let result;



            try{


                result =
                JSON.parse(text);


            }
            catch(error){


                console.error(
                    "Invalid Server Response:",
                    text.substring(0,200)
                );


                return {

                    success:false,

                    message:
                    "Invalid server response"

                };


            }



            if(!response.ok){


                return {

                    success:false,

                    message:
                    result.message ||
                    "Request Failed"

                };


            }



            return result;



        }
        catch(error){


            console.error(
                "API Error:",
                error
            );


            return {

                success:false,

                message:
                error.message

            };


        }


    },





    // ======================================
    // Telegram Login
    // POST /api/auth/login
    // ======================================


    async login(){


        return await this.request(

            "/api/auth/login",

            "POST",

            {

                initData:
                TelegramApp.initData

            }

        );


    },







    // ======================================
    // User Profile
    // GET /api/user/:telegramId
    // ======================================


    async getProfile(telegramId){


        return await this.request(

            `/api/user/${telegramId}`

        );


    },






    // ======================================
    // Update User
    // PUT /api/user/:telegramId
    // ======================================


    async updateProfile(
        telegramId,
        data
    ){


        return await this.request(

            `/api/user/${telegramId}`,

            "PUT",

            data

        );


    },







    // ======================================
    // Coin Tap Mining
    // POST /api/tap
    // ======================================


    async tap(
        telegramId,
        amount = 1
    ){


        return await this.request(

            "/api/tap",

            "POST",

            {

                telegramId,

                tap:amount

            }

        );


    },







    // ======================================
    // Balance
    // ======================================


    async getBalance(telegramId){


        return await this.request(

            `/api/balance/${telegramId}`

        );


    },







    // ======================================
    // Daily Reward
    // ======================================


    async claimDaily(userId){


        return await this.request(

            "/api/reward/daily",

            "POST",

            {

                userId

            }

        );


    },







    // ======================================
    // Referral
    // ======================================


    async getReferrals(userId){


        return await this.request(

            `/api/referrals/${userId}`

        );


    },







    // ======================================
    // Leaderboard
    // ======================================


    async getLeaderboard(){


        return await this.request(

            "/api/leaderboard"

        );


    }


};






// ==========================================
// Global Export
// ==========================================

window.API = API;
