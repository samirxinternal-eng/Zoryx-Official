// ========================================
// Zoryx Telegram WebApp
// server/database.js
// ========================================

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client = null;
let database = null;

// ========================================
// Connect MongoDB
// ========================================

export async function connectDatabase(){

    try{

        if(database){

            return database;

        }

        const uri = process.env.MONGODB_URI;

        if(!uri){

            throw new Error(
                "MONGODB_URI not found in .env"
            );

        }

        client = new MongoClient(uri);

        await client.connect();

        database = client.db(

            process.env.DB_NAME ||

            "zoryx"

        );

        console.log(

            "✅ MongoDB Connected"

        );

        return database;

    }
    catch(error){

        console.error(

            "❌ MongoDB Connection Failed"

        );

        console.error(error);

        process.exit(1);

    }

}



// ========================================
// Get Database
// ========================================

export function getDatabase(){

    if(!database){

        throw new Error(

            "Database Not Connected"

        );

    }

    return database;

}



// ========================================
// Close Database
// ========================================

export async function closeDatabase(){

    try{

        if(client){

            await client.close();

            console.log(

                "🔌 MongoDB Disconnected"

            );

        }

    }
    catch(error){

        console.log(error);

    }

}



// ========================================
// Create Collections
// ========================================

export async function initializeDatabase(){

    const db = getDatabase();

    const collections = await db.listCollections().toArray();

    const names = collections.map(

        c=>c.name

    );



    if(

        !names.includes("users")

    ){

        await db.createCollection(

            "users"

        );

    }



    if(

        !names.includes("tasks")

    ){

        await db.createCollection(

            "tasks"

        );

    }



    if(

        !names.includes("daily_rewards")

    ){

        await db.createCollection(

            "daily_rewards"

        );

    }



    if(

        !names.includes("leaderboard")

    ){

        await db.createCollection(

            "leaderboard"

        );

    }



    await db.collection("users").createIndex(

        {

            telegramId:1

        },

        {

            unique:true

        }

    );



    await db.collection("users").createIndex(

        {

            uid:1

        },

        {

            unique:true

        }

    );



    console.log(

        "✅ Database Initialized"

    );

    }
