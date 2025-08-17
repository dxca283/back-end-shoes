import mysql from "mysql2/promise";
import { NODE_ENV } from "../config/env.js";
let connection;

const connectToDatabase = async () => {
  try {
    if (!connection) {
      connection = await mysql.createConnection({
        host: "localhost",
        user: "goat_mem",
        password: "123456",
        database: "db_project_trainer",
      });
      console.log(`✅ Connected to MySQL Database in ${NODE_ENV} mode`);
    }
    return connection;
  } catch (error) {
    console.error("❌ Error connecting to Database:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
