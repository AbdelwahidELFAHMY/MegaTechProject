
import mysql from 'mysql2/promise';

// Set up MySQL pool
 const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'megatech_db'
});

export default pool;
