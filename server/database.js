import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let client;
let database;

export default async function connectDatabase() {
    try {

        if (database) {
            return database;
        }

        client = new MongoClient(uri);

        await client.connect();

        database = client.db(process.env.DB_NAME);

        console.log("========================================");
        console.log("✅ MongoDB Connected Successfully");
        console.log(`📂 Database : ${process.env.DB_NAME}`);
        console.log("========================================");

        return database;

    } catch (error) {

        console.error("========================================");
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        console.error("========================================");

        process.exit(1);
    }
}

export function getDatabase() {

    if (!database) {
        throw new Error("Database is not connected.");
    }

    return database;
    }
