// ==========================================
// Zoryx Telegram WebApp
// client/api.js
// ==========================================


const API = {


    BASE_URL: window.location.origin,



    // ======================================
    // Request Handler
    // ======================================

    async request(endpoint, method = "GET", data = null) {


        try {


            const options = {

                method,

                headers: {

                    "Content-Type": "application/json"

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



            const result =
                await response.json();



            if(!response.ok){

                throw new Error(
                    result.message ||
                    "API Request Failed"
                );

            }



            return result;



        } catch(error){


            console.error(
                "API Error:",
                error
            );



            return {

                success:false,

                message:error.message

            };


        }


    },





    // ======================================
    // Telegram Authentication
    // ======================================


    async login(){


        return await this.request(

            "/api/auth",

            "POST",

            {

                initData:
                TelegramApp.initData

            }

        );


    },





    // ======================================
    // Profile
    // ======================================


    async getProfile(telegramId){


        return await this.request(

            `/api/profile/${telegramId}`

        );


    },





    // ======================================
    // Tap / Mining
    // ======================================


    async tap(telegramId, amount){


        return await this.request(

            "/api/tap",

            "POST",

            {

                telegramId,

                tap: amount

            }

        );


    },





    // ======================================
    // Balance
    // ======================================


    async addBalance(userId, amount){


        return await this.tap(

            userId,

            amount

        );


    },





    // ======================================
    // Reward
    // ======================================


    async claimDaily(userId){


        return await this.request(

            "/api/reward/daily",

            "POST",

            {

                telegramId:userId

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





// Global

window.API = API;
