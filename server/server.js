// ========================================
// Zoryx Telegram WebApp
// server/server.js
// ========================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import routes from "./routes.js";

import {
    connectDatabase,
    initializeDatabase
} from "./database.js";

dotenv.config();

const app = express();

const PORT =
process.env.PORT || 3000;



// ========================================
// Middleware
// ========================================

app.use(cors());

app.use(express.json({
    limit:"10mb"
}));

app.use(express.urlencoded({
    extended:true
}));

app.use(morgan("dev"));



// ========================================
// API Routes
// ========================================

app.use("/", routes);



// ========================================
// 404
// ========================================

app.use((req,res)=>{

    res.status(404).json({

        success:false,

        message:"API Not Found"

    });

});



// ========================================
// Error Handler
// ========================================

app.use((err,req,res,next)=>{

    console.error(err);

    res.status(500).json({

        success:false,

        message:"Internal Server Error"

    });

});



// ========================================
// Start Server
// ========================================

async function startServer(){

    try{

        await connectDatabase();

        await initializeDatabase();

        app.listen(

            PORT,

            ()=>{

                console.log("");

                console.log(
                "================================="
                );

                console.log(
                "🚀 Zoryx Server Started"
                );

                console.log(
                `🌐 Port : ${PORT}`
                );

                console.log(
                `📦 Environment : ${
                    process.env.NODE_ENV ||
                    "development"
                }`
                );

                console.log(
                "================================="
                );

                console.log("");

            }

        );

    }
    catch(error){

        console.error(

            "❌ Server Failed To Start"

        );

        console.error(error);

        process.exit(1);

    }

}

startServer();
