import mysql from 'mysql2/promise';

let connection = null;

export async function getConnection() {

  if(!connection) {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });

    connection.on('error', async (err) => {
      console.error('MySQL error', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting...');
        connection = null;
        await connectDB();
      }
    });
  }
  return connection;
}
