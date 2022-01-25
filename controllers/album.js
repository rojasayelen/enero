'use strict'

//controlador para dar de alta, modificar, eliminar albumes
var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
//const { restart } = require('nodemon');

//creamos el método que nos permitirá sacar un album de la bd
function getAlbum(req, res){
    var albumId = req.params.id

    Album.findById(albumId).populate({path: 'artist'}).exec((err, album) =>{
        if(err){
            res.status(500).send({message: 'error en la peticion'});
        }else{
            if(!album){
                res.status(404).send({message: 'el album no existe'})
            }else{
                res.status(200).send({album});
            }
        }
    })

    //res.status(200).send({message: 'Accion getAlbun'});
}

function saveAlbum(req, res){
    var album = new Album();

    var params = req.body;
     album.title = params.title;
     album.description = params.description;
     album.year = params.year;
     album.image = 'null';
     album.artist = params.artist;

    album.save((err, albumStored) =>{
        if(err){
            res.status(500).send({message: 'Error en la petición del servidor'})
        }else{
            if(!albumStored){
                res.status(404).send({message: 'no se ha guardado el album'});
            }else{
                res.status(200).send({album: albumStored});
            }
        }
    });
}

module.exports = {
    getAlbum,
    saveAlbum,
}