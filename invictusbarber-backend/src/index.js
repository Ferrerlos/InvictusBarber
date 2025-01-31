const express = require('express'); // Importa el módulo de Express para crear el servidor
const bodyParser = require('body-parser'); // Permite analizar cuerpos de solicitudes entrantes
const cors = require('cors'); // Habilita CORS para permitir solicitudes desde diferentes dominios
const mysql = require('mysql'); // Módulo para conectarse a bases de datos MySQL
const nodemailer = require('nodemailer'); // Permite enviar correos electrónicos
const { format } = require('date-fns'); // Biblioteca para formatear fechas
const { es } = require('date-fns/locale'); // Configuración regional en español para formatear fechas
const { v4: uuidv4 } = require('uuid'); // Genera identificadores únicos
const { populateAppointments, scheduleAppointmentCleanup } = require('./populateAppointments'); // Funciones personalizadas para inicializar y limpiar citas

const app = express(); // Inicializa la aplicación de Express
const port = process.env.PORT || 3001; // Define el puerto del servidor

app.use(cors()); // Habilita CORS en la aplicación
app.use(bodyParser.json()); // Configura body-parser para analizar JSON en las solicitudes

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'Ferrerlos',
  password: '02125636931Carli',
  database: 'invictusbarber'
});

// Conexión a la base de datos MySQL
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL.');
  populateAppointments(); // Inicializa citas disponibles
  scheduleAppointmentCleanup(); // Programa limpieza de citas vencidas
});

// Configuración del servicio de correo con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ferrerlosvergara@gmail.com',
    pass: 'eevn fiwh cyow rdzy' // Contraseña de la aplicación (no compartir públicamente)
  }
});

// Ruta para obtener todas las citas disponibles
app.get('/appointments', (_, res) => {
  db.query('SELECT * FROM appointments WHERE status = "Disponible"', (err, results) => {
    if (err) {
      return res.status(500).send(err); // Error al consultar la base de datos
    }
    res.json(results); // Devuelve las citas en formato JSON
  });
});

// Ruta para obtener citas disponibles según la fecha
app.get('/appointments/:date', (req, res) => {
  const { date } = req.params;
  db.query('SELECT * FROM appointments WHERE date = ? AND status = "Disponible"', [date], (err, results) => {
    if (err) {
      return res.status(500).send(err); // Error al consultar la base de datos
    }
    res.json(results); // Devuelve las citas en formato JSON
  });
});

// Ruta para actualizar el estado de una cita
app.put('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status, email, phone } = req.body;
  db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      return res.status(500).send(err); // Error al actualizar la base de datos
    }

    if (status === 'Reservado') {
      // Si la cita se reserva, enviar correo electrónico de confirmación
      db.query('SELECT * FROM appointments WHERE id = ?', [id], (err, results) => {
        if (err) {
          return res.status(500).send(err); // Error al consultar la cita
        }

        const appointment = results[0]; // Detalles de la cita reservada
        const formattedDate = format(new Date(appointment.date), 'EEEE dd MMMM yyyy', { locale: es }); // Formatear la fecha en español
        const changeId = uuidv4(); // Generar un ID único para el enlace de gestión
        const manageLink = `http://localhost:4200/confirm/${changeId}`; // Enlace para modificar/cancelar cita
        const mailOptions = {
          from: 'ferrerlosvergara@gmail.com',
          to: email,
          subject: 'Reserva de cita en Invictus Barber',
          text: `Estimado cliente,

Su cita en Invictus Barber ha sido reservada.

Detalles de la cita:
- Fecha: ${formattedDate}
- Hora: ${appointment.time}

Puede modificar o cancelar su cita haciendo clic en el siguiente enlace:
${manageLink}

Atentamente,
Invictus Barber`
        };

        // Registrar el cambio en la tabla de cambios de citas
        db.query('INSERT INTO appointment_changes (appointment_id, change_id, email, phone) VALUES (?, ?, ?, ?)', [id, changeId, email, phone], (err) => {
          if (err) {
            return res.status(500).send(err); // Error al registrar el cambio
          }

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error al enviar el correo:', error);
            } else {
              console.log('Correo enviado:', info.response);
            }
          });

          res.json({ message: 'Cita actualizada exitosamente' });
        });
      });
    } else {
      res.json({ message: 'Cita actualizada exitosamente' });
    }
  });
});

// Ruta para confirmar, modificar o cancelar una cita
app.put('/confirm/:changeId', (req, res) => {
  const { changeId } = req.params; // Obtener el identificador único del cambio desde los parámetros de la URL
  const { action, newDate, newTime } = req.body; // Obtener la acción (modificar o cancelar) y los nuevos detalles de la cita desde el cuerpo de la solicitud

  // Verificar si el enlace de cambio ya fue utilizado previamente
  db.query('SELECT * FROM appointment_changes WHERE change_id = ?', [changeId], (err, results) => {
    if (err) {
      console.error('Error al consultar la tabla appointment_changes:', err);
      return res.status(500).send('Error en el servidor al verificar el cambio.');
    }

    // Si no se encuentra el enlace o ya fue utilizado, enviar un mensaje de error
    if (results.length === 0 || results[0].used) {
      return res.status(400).send('El enlace ya ha sido utilizado. Contacta con la barbería para obtener ayuda.');
    }

    const appointmentId = results[0].appointment_id; // ID de la cita actual
    const email = results[0].email; // Correo electrónico del cliente
    const phone = results[0].phone; // Teléfono del cliente

    if (action === 'modify' && newDate && newTime) {
      // **MODIFICAR UNA CITA**

      // Primero, marcar la cita actual como "Disponible" para que otro cliente pueda reservarla
      db.query('UPDATE appointments SET status = "Disponible" WHERE id = ?', [appointmentId], (err) => {
        if (err) {
          console.error('Error al liberar la cita antigua:', err);
          return res.status(500).send('Error al actualizar la cita antigua.');
        }

        // Buscar si existe una cita disponible en la nueva fecha y hora seleccionadas
        db.query(
          'SELECT id FROM appointments WHERE date = ? AND time = ? AND status = "Disponible"',
          [newDate, newTime],
          (err, results) => {
            if (err) {
              console.error('Error al buscar la nueva cita:', err);
              return res.status(500).send('Error al buscar disponibilidad.');
            }

            // Si no hay citas disponibles en la fecha y hora solicitadas, enviar un mensaje de error
            if (results.length === 0) {
              return res.status(400).send('No hay citas disponibles en la fecha y hora seleccionadas.');
            }

            const newAppointmentId = results[0].id; // ID de la nueva cita disponible

            // Reservar la nueva cita seleccionada
            db.query('UPDATE appointments SET status = "Reservado" WHERE id = ?', [newAppointmentId], (err) => {
              if (err) {
                console.error('Error al reservar la nueva cita:', err);
                return res.status(500).send('Error al reservar la nueva cita.');
              }

              // Generar un nuevo identificador único para el cambio de cita
              const newChangeId = uuidv4();
              // Formatear la fecha para que sea más amigable en el correo
              const formattedDate = format(new Date(newDate), 'EEEE dd MMMM yyyy', { locale: es });
              // Crear el enlace para gestionar la nueva cita
              const manageLink = `http://localhost:4200/confirm/${newChangeId}`;

              // Configurar el correo de confirmación
              const mailOptions = {
                from: 'ferrerlosvergara@gmail.com',
                to: email,
                subject: 'Modificación de cita en Invictus Barber',
                text: `Estimado cliente,

Su cita ha sido modificada exitosamente.

Detalles de la nueva cita:
- Fecha: ${formattedDate}
- Hora: ${newTime}

Puede modificar o cancelar esta cita usando el siguiente enlace:
${manageLink}

Saludos cordiales,
Invictus Barber`
              };

              // Registrar el nuevo cambio en la tabla de cambios de citas
              db.query(
                'INSERT INTO appointment_changes (appointment_id, change_id, email, phone) VALUES (?, ?, ?, ?)',
                [newAppointmentId, newChangeId, email, phone],
                (err) => {
                  if (err) {
                    console.error('Error al registrar el nuevo cambio:', err);
                    return res.status(500).send('Error al registrar el cambio.');
                  }

                  // Marcar el enlace anterior como "usado" para evitar que sea reutilizado
                  db.query('UPDATE appointment_changes SET used = TRUE WHERE change_id = ?', [changeId], (err) => {
                    if (err) {
                      console.error('Error al marcar el cambio anterior como usado:', err);
                      return res.status(500).send('Error al actualizar el estado del enlace.');
                    }

                    // Enviar el correo al cliente con los detalles de la nueva cita
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        console.error('Error al enviar el correo:', error);
                      } else {
                        console.log('Correo enviado con éxito:', info.response);
                      }
                    });

                    // Responder al cliente indicando que la cita fue modificada con éxito
                    res.json({ message: 'Cita modificada con éxito.' });
                  });
                }
              );
            });
          }
        );
      });
    } else if (action === 'cancel') {
      // **CANCELAR UNA CITA**

      // Cambiar el estado de la cita a "Disponible"
      db.query('UPDATE appointments SET status = "Disponible" WHERE id = ?', [appointmentId], (err) => {
        if (err) {
          console.error('Error al cancelar la cita:', err);
          return res.status(500).send('Error al cancelar la cita.');
        }

        // Marcar el enlace como "usado" para evitar reutilizaciones
        db.query('UPDATE appointment_changes SET used = TRUE WHERE change_id = ?', [changeId], (err) => {
          if (err) {
            console.error('Error al marcar el cambio como usado:', err);
            return res.status(500).send('Error al actualizar el estado del enlace.');
          }

          // Responder al cliente indicando que la cita fue cancelada con éxito
          res.json({ message: 'Cita cancelada con éxito.' });
        });
      });
    } else {
      // Si la acción no es válida, devolver un error
      res.status(400).send('Acción inválida. Usa "modify" o "cancel".');
    }
  });
});

// Iniciar el servidor en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});