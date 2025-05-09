require('dotenv').config(); // Cargar variables .env
const express = require('express');
const PORT = process.env.PORT || 5000;
const fire = require('./firebase');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send(
    '<h1>API Express & Firebase MonitoreO2</h1><ul><li><p><b>GET /ver</b></p></li><li><p><b>GET /valor</b></p></li><li><p><b>GET /estado</b></p></li><li><p><b>POST /insertar</b>  => {temp, hum, gas, ruido, nombre, fecha}</p></li><li><p><b>POST /encender</b></p></li><li><p><b>POST /apagar</b></p></li><li><p>/encender</p></li><li><p>/apagar</p></li><li><p>/estado</p></li></ul>'
  );
});

const getDB = () => {
  const db = fire.firestore();
  db.settings({ timestampsInSnapshots: true });
  return db;
};

app.get('/ver', (req, res) => {
  const db = getDB();
  let wholeData = [];
  db.collection('Valores').orderBy('fecha', 'asc').get()
    .then(snapshot => {
      snapshot.forEach(doc => wholeData.push(doc.data()));
      res.send(wholeData);
    })
    .catch(error => console.log('Error!', error));
});

app.get('/estados', (req, res) => {
  const db = getDB();
  let wholeData = [];
  db.collection('Rele').orderBy('fecha', 'asc').get()
    .then(snapshot => {
      snapshot.forEach(doc => wholeData.push(doc.data()));
      res.send(wholeData);
    })
    .catch(error => console.log('Error!', error));
});

app.get('/estado', (req, res) => {
  const db = getDB();
  let wholeData = [];
  db.collection('Rele').limit(1).orderBy('fecha','desc').get()
    .then(snapshot => {
      snapshot.forEach(doc => wholeData.push(doc.data()));
      res.send(wholeData);
    })
    .catch(error => console.log('Error!', error));
});

app.get('/valor', (req, res) => {
  const db = getDB();
  let wholeData = [];
  db.collection('Valores').limit(1).orderBy('fecha','desc').get()
    .then(snapshot => {
      snapshot.forEach(doc => wholeData.push(doc.data()));
      res.send(wholeData);
    })
    .catch(error => console.log('Error!', error));
});

app.get('/grafica', (req, res) => {
  const db = getDB();
  let wholeData = [];
  db.collection('Valores').limit(10).orderBy('fecha','desc').get()
    .then(snapshot => {
      snapshot.forEach(doc => wholeData.push(doc.data()));
      res.send(wholeData);
    })
    .catch(error => console.log('Error!', error));
});

app.post('/insertar', (req, res) => {
  const db = getDB();
  const data = {
    fecha: new Date().toJSON(),
    temp: req.body.temp,
    distancia: req.body.dist,
    nivelAgua: req.body.nivelAgua,
    cantidadAgua: req.body.cantidadAgua,
    porcentajeLlenado: req.body.porcentajeLlenado
  };
  db.collection('Valores').add(data)
    .then(() => res.send({ ...data, status: 'Valores insertados!' }))
    .catch(error => res.status(500).send({ error: 'Error al insertar', details: error }));
});

app.post('/encender', (req, res) => {
  const db = getDB();
  const data = {
    r1: true,
    nombre: req.body.nombre,
    fecha: new Date()
  };
  db.collection('Rele').add(data)
    .then(() => res.send({ ...data, status: 'Rele encendido' }))
    .catch(error => res.status(500).send({ error: 'Error al encender', details: error }));
});

app.post('/apagar', (req, res) => {
  const db = getDB();
  const data = {
    r1: false,
    nombre: req.body.nombre,
    fecha: new Date()
  };
  db.collection('Rele').add(data)
    .then(() => res.send({ ...data, status: 'Rele apagado' }))
    .catch(error => res.status(500).send({ error: 'Error al apagar', details: error }));
});

app.listen(PORT, () => {
  console.log(`Escuchando en puerto ${PORT}`);
});
