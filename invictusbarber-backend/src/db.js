const mysql = require('mysql');

const dbConfig = {
  host: 'localhost',
  user: 'Ferrerlos',
  password: '02125636931Carli',
  database: 'invictusbarber'
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(err => {
    if (err) {
      console.error('Error connecting to the database:', err);
      setTimeout(handleDisconnect, 2000); // Intentar reconectar después de 2 segundos
    } else {
      console.log('Connected to the MySQL database.');
    }
  });

  connection.on('error', err => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconectar automáticamente en caso de pérdida de conexión
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;