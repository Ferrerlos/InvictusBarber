const { format, addDays, addHours, isBefore, startOfDay, isSameDay, subHours } = require('date-fns'); // Importa las funciones necesarias de date-fns
const cron = require('node-cron'); // Importa el paquete node-cron para tareas programadas
const db = require('./db'); // Importa la conexión de la base de datos

// Función para poblar la base de datos con citas
function populateAppointments() {
  const today = new Date(); // Obtiene la fecha y hora actual
  const ninePM = addHours(startOfDay(today), 21); // Calcula las 9 PM del día actual
  const twoMonthsLater = addDays(today, 62); // Calcula la fecha dentro de 62 días (aproximadamente dos meses)

  const appointments = []; // Arreglo para almacenar las citas que se van a insertar
  for (let day = today; day <= twoMonthsLater; day = addDays(day, 1)) { // Itera por cada día desde hoy hasta dos meses después
    if (day.getDay() !== 0) { // Excluye los domingos (getDay() devuelve 0 para domingos)
      for (let hour = 9; hour <= 21; hour++) { // Horas de trabajo: de 9 AM a 9 PM
        const date = format(day, 'yyyy-MM-dd'); // Formatea la fecha en formato 'yyyy-MM-dd'
        const time = `${hour}:00:00`; // Define la hora en formato 'HH:mm:ss'
        const title = `Cita ${hour}`; // Título genérico de la cita
        const status = 'Disponible'; // Estado inicial de la cita

        // No crear citas para el día actual si ya han pasado las 9 PM
        if (!(isSameDay(day, today) && isBefore(ninePM, today))) {
          appointments.push([date, time, title, status]); // Agrega la cita al arreglo
        }
      }
    }
  }

  // Consulta SQL para insertar una cita si no existe ya en la base de datos
  const query = `
    INSERT INTO appointments (date, time, title, status) 
    SELECT * FROM (SELECT ? AS date, ? AS time, ? AS title, ? AS status) AS tmp 
    WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE date = ? AND time = ?) 
    LIMIT 1
  `;
  
  // Recorre el arreglo de citas y las inserta en la base de datos
  appointments.forEach(appointment => {
    db.query(query, [...appointment, appointment[0], appointment[1]], (err, result) => {
      if (err) {
        console.error('Error al insertar la cita:', err); // Maneja errores al insertar
        return;
      }
      if (result.affectedRows > 0) { // Verifica si se insertó una cita nueva
        console.log(`Cita insertada el ${appointment[0]} a las ${appointment[1]}`);
      }
    });
  });
}

// Función para programar la limpieza de citas antiguas
function scheduleAppointmentCleanup() {
  // Configura una tarea programada que se ejecuta cada minuto
  cron.schedule('* * * * *', () => {
    const now = new Date(); // Obtiene la fecha y hora actual
    const oneHourLater = addHours(now, 1); // Calcula 1 hora después de la hora actual
    
    // Consulta SQL para eliminar las filas correspondientes en appointment_changes
    const deleteChangesQuery = `
      DELETE FROM appointment_changes 
      WHERE appointment_id IN (
        SELECT id FROM appointments 
        WHERE (date < CURDATE() OR (date = CURDATE() AND time < ?))
        OR (date = CURDATE() AND time <= ?)
      )
    `;
    
    db.query(deleteChangesQuery, [format(oneHourLater, 'HH:mm:ss'), format(now, 'HH:mm:ss')], (err, result) => {
      if (err) {
        console.error('Error al eliminar cambios de citas pasadas:', err); // Maneja errores al eliminar
        return;
      }
      console.log(`Eliminadas ${result.affectedRows} filas de cambios de citas pasadas.`); // Registra la cantidad de filas eliminadas

      // Consulta SQL para eliminar citas pasadas
      const deleteAppointmentsQuery = `
        DELETE FROM appointments 
        WHERE (date < CURDATE() OR (date = CURDATE() AND time < ?))
        OR (date = CURDATE() AND time <= ?)
      `;
      
      // Ejecuta la consulta para borrar las citas pasadas
      db.query(deleteAppointmentsQuery, [format(oneHourLater, 'HH:mm:ss'), format(now, 'HH:mm:ss')], (err, result) => {
        if (err) {
          console.error('Error al eliminar citas pasadas:', err); // Maneja errores al borrar
          return;
        }
        console.log(`Eliminadas ${result.affectedRows} citas pasadas.`); // Registra la cantidad de citas eliminadas
      });
    });
  });
}

// Exporta las funciones para ser utilizadas en otros módulos
module.exports = { populateAppointments, scheduleAppointmentCleanup };