'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//cargar rutas
var user_routes = require('./routes/user'); //para utilizar las rutas de los usuarios en forma global
var artist_routes = require('./routes/artist'); //para utilizar las rutas de los artistas en forma global
var album_routes = require('./routes/album');


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//configurar las cabeceras http

//rutas base    
app.use('/api', user_routes); 
app.use('/api', artist_routes); 
app.use('/api', album_routes);

module.exports = app;