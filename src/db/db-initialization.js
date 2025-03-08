import {
  getConnection,
} from './connection.js';

export async function initializeTables() {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type_id INT NOT NULL,
        prefix CHAR(1) NOT NULL,
        UNIQUE KEY unique_item (prefix, type_id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS combinations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        combination JSON NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        request_data JSON NOT NULL,
        combination_id INT NOT NULL,
        FOREIGN KEY (combination_id) REFERENCES combinations(id) ON DELETE CASCADE
      );
    `);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
}
