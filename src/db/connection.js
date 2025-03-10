import mysql from "mysql2/promise";

/**
 * @type {import("mysql2/promise").Connection | null}
 */
let connection = null;

/**
 * @returns {Promise<import("mysql2/promise").Connection>}
 */
export async function getConnection() {

  try {
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      });
    }

    return connection;
  } catch (error) {
    console.error("getConnection", error);
    throw new Error("Connection to database failed");
  }
}
