// ========================================
// Zoryx Telegram WebApp
// server/auth.js
// ========================================

import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();



// ========================================
// Create Telegram Secret
// ========================================

function createSecretKey(){

    return crypto
        .createHmac(
            "sha256",
            "WebAppData"
        )
        .update(
            process.env.BOT_TOKEN
        )
        .digest();

}



// ========================================
// Verify Telegram WebApp Login
// ========================================

export function verifyTelegramAuth(data){

    try{

        if(
            !data ||
            !data.initData
        ){

            return{

                success:false,

                message:"InitData Missing"

            };

        }



        const initData =
        data.initData;



        const params =
        new URLSearchParams(
            initData
        );



        const hash =
        params.get("hash");



        if(!hash){

            return{

                success:false,

                message:"Hash Missing"

            };

        }



        params.delete("hash");



        const dataCheckString =
        [...params.entries()]
        .sort(
            (a,b)=>
            a[0].localeCompare(
                b[0]
            )
        )
        .map(
            ([k,v])=>
            `${k}=${v}`
        )
        .join("\n");



        const secret =
        createSecretKey();



        const calculatedHash =
        crypto
        .createHmac(

            "sha256",

            secret

        )
        .update(
            dataCheckString
        )
        .digest("hex");



        if(
            calculatedHash !== hash
        ){

            return{

                success:false,

                message:"Invalid Telegram Signature"

            };

        }



        const authDate =
        Number(
            params.get(
                "auth_date"
            )
        );



        const now =
        Math.floor(
            Date.now()/1000
        );



        if(
            now-authDate >
            86400
        ){

            return{

                success:false,

                message:"Login Expired"

            };

        }



        const user =
        JSON.parse(

            params.get("user")

        );



        return{

            success:true,

            user

        };



    }
    catch(error){

        return{

            success:false,

            message:error.message

        };

    }

                }
