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

                method: method,

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



            const text =
                await response.text();



            let result;


            try {

                result = JSON.parse(text);

            } catch(error) {


                console.error(
                    "Invalid JSON Response:",
                    text.substring(0,200)
                );


                return {

                    success:false,

                    message:
                    "Server returned invalid response"

                };

            }



            if(!response.ok){


                return {

                    success:false,

                    message:
                    result.message ||
                    "API Request Failed"

                };


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
    // Update Profile
    // PUT /api/user/:telegramId
    // ======================================


    async updateProfile(telegramId,data){


        return await this.request(

            `/api/user/${telegramId}`,

            "PUT",

            data

        );


    },





    // ======================================
    // Tap / Mining
    // POST /api/tap
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


    async getBalance(telegramId){


        return await this.request(

            `/api/balance/${telegramId}`

        );


    },





    async addBalance(userId, amount){


        return await this.request(

            "/api/balance/add",

            "POST",

            {

                userId,

                amount

            }

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
// Global
// ==========================================

window.API = API;
