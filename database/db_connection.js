import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'goat_mem',
    password: '123456',
    database: 'db_project_trainer'
})

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database successfully!');
});
export default connection;