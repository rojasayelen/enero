'use strict'

//controlador para dar de alta, modificar, eliminar artistas
var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination')

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
const { restart } = require('nodemon');

//creamos el método que nos permitirá sacar un artista de la bd
function getArtist(req, res){

    var artistId = req.params.id;
    
    Artist.findById(artistId, (err, artist) =>{
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        }else{
            if(!artist){
                res.status(404).send({message: 'El artista no existe'});
            }else{
                res.status(200).send({artist});
            }
        }
    });
    //res.status(200).send({message: 'método getArtist del controlador artist.js'});
}
//creamos el método para paginar y mostrar deterinada cantidad de artistas por página
function getArtists(req, res){

    if(req.params.page){
        var page = req.params.page;
    }else{
        var page = 1;
    }
     
    var itemsPerPage = 3;
    
    Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total){
        if(err){
           res.status(500).send({message: 'Error en la petición'});     
        }else{
            if(!artists){             
                 res.status(404).send({message: 'No hay artistas'});
            }else{
                return res.status(200).send({
                    total_items: total,
                    artists: artists, 
                    });                
                }
    }
    });
}
//creamos el método para guardar artistas
function saveArtist(req, res){
    var artist = new Artist();

    var params = req.body;
     artist.name = params.name;
     artist.description = params.description;
     artist.image = 'null';

     artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({message: 'Error al guardar el artista'});
        }else{
            if(!artistStored){
                res.status(404).send({message: 'El artista no ha sido guardado'});
            }else{
                res.status(200).send({artist: artistStored});
            }
        }
     });
}
//creamos la funcion de update de los artistas
function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    //creamos la funcion para comparar los id de los artistas y actualizarlos
    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) =>{
        if(err){
            res.status(500).send({message: 'Error al actualizar el artista '});
        }else{
            if(!artistUpdated){
                res.status(404).send({message: 'No se ha podido actualizar el artista'});
            }else{
                res.status(200).send({artist: artistUpdated});
            }
        }
    });
}

function deleteArtist(req, res){
    var artistId = req.params.id;
    
    Artist.findByIdAndRemove(artistId, (err, artistRemoved)=> {
        if(err){
            res.status(500).send({message: 'Error al borrar el artista'});
        }else{
            if(!artistRemoved){
                res.status(404).send({message: 'no se encontró el artista para borrar'});
                }else{

                Album.find({artist: artistRemoved._id}).remove((err, albumRemoved)=> {
                    if(err){
                        res.status(500).send({message: 'Error al borrar el Albmum'});
                    }else{
                        if(!albumRemoved){
                            res.status(404).send({message: 'no se encontró el album para borrar'});
                        }else{ 
                            Song.find({album: albumRemoved._id}).remove((err, songRemoved)=> {
                                if(err){
                                    res.status(500).send({message: 'Error al borrar la canción'});
                                }else{
                                    if(!songRemoved){
                                        res.status(404).send({message: 'no se encontró la canción para borrar'});
                                    }else{ 
                                        res.status(200).send({artist: artistRemoved})
                                    }
                                }    
                            });   
                        }
                    }    
                });
            }
        }
    });
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'imagen no subida';
    
    if(req.files){
        var file_path = req.files.image.path;      
        var file_split = file_path.split('\\');    
        var file_name = file_split[2];            
        var ext_split = file_name.split('\.');   
        var file_ext = ext_split[1];      
    
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){

            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(!artistUpdated){
                    res.status(500).send({message: 'No se a ha podido actualizar la imagen del artista'});
                }else{
                    res.status(200).send({artist: artistUpdated});
                }
            });
        }else{
                   
            res.status(200).send({message: 'Extensión del archivo no válida'});
        }

    }else{
        res.satatus(200).send({message: 'no hay subido ninguna imagen'});
    }
}

//creo el método para trabajar las imagenes

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var path_file = './uploads/artists/'+imageFile;

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'no existe la imagen'});
        }
    });
}    
    

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile,
}
