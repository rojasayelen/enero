'use strict'


var fs = require('fs'); //importa el file system, que es un sistema de ficheros
var path = require('path'); //permite acceder a rutas completas
var bcrypt = require('bcrypt-nodejs'); //importa la librería para encriptar passwords
const { restart } = require('nodemon');
var User = require('../models/users'); //importa los modelos de usuarios creados 
var jwt = require('../services/jwt'); //importa el servicio jwt

//creo una función para realizar pruebas en postman
function pruebas(req, res){ 
    res.status(200).send({
        message: 'probando una accion del controller de us del api rest con node y Mongo'
    });
};

//creo la función para guardar usuarios
function saveUser(req, res){
    var user = new User();

    var params = req.body;

    console.log(params);

    //creo el objeto de usuario
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    if(params.password){
        //encriptar la password
        bcrypt.hash(params.password, null, null, function(err, hash){
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null) {
               //guardar el usuario
                   user.save((err, userStored) =>{
                   if(err){
                        res.status(500).send({message: 'Error al guardar el usuario'}) 
                   }else{
                        if(!userStored){
                            res.status(404).send({message: 'No se ha registrado el usuario '})
                        }else{
                            res.status(200).send({user: userStored});
                        }
                    }
                });
            }else{
                res.status(200).send({message: 'Introduce todos los campos'})        
            }
        });
    }else{
        res.status(200).send({message: 'Introduce la contraseña'})
    }
};
//creo la función de login
function loginUser(req, res){
        var params = req.body; //extraigo la info del body

        var email = params.email; 
        var password = params.password;

        User.findOne({email: email.toLowerCase()}, (err, user) => {
            if(err){
                res.status(500).send({message: 'error en la peticion'});
            }else{
                if(!user){
                    res.status(404).send({message: 'Usuario inexistente'});
                }else{
                    //comprobar la contraseña
                    bcrypt.compare(password, user.password, function(err, check){
                        if(check){
                             //devolver los datos del usuario logueado
                            if(params.gethash){
                                 //devolver un token de jwt
                                res.status(200).send({
                                    token: jwt.createToken(user) 
                                });
                            }else{
                                res.status(200).send({user});
                            }
                        }else{
                            res.status(404).send({message: 'el usuario no ha podido loguearse'});
                        }
                    });
                }
            }
        })
}

//creo la función para actualizar usuarios
function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    //creo el método para comparar id y actualizar usuarios
    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if(err){
            res.status(500).send({message: 'Error al actualizar el usuario'});
        }else{
            if(!userUpdated){
            res.status(404).send({message: 'No se a ha podido actualizar el usuario '});
        }else{
            res.status(200).send({user: userUpdated});
            }
        }
    })
}

//creo la funcion para actualizar imagenes del ávatar
function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'imagen no subida';
    
    if(req.files){
        var file_path = req.files.image.path;     //devuelte la ruta de la imagen
        var file_split = file_path.split('\\');   //extrae la ruta
        var file_name = file_split[2];            //extrae el nombre
        var ext_split = file_name.split('\.');    // extrae la extensión
        var file_ext = ext_split[1];            //devuelve la extensión

        //console.log(file_split);
        //console.log(exp_split);
        //console.log(file_path);

    // para analizar si el fichero tiene la extensión deseada
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){

            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {
                if(!userUpdated){
                    res.status(500).send({message: 'No se a ha podido actualizar el usuario'});
                }else{
                    res.status(200).send({user: userUpdated});
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
    var path_file = './uploads/users/'+imageFile;

    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'no existe la imagen'});
        }
    });
}
 
//exporto los métodos para ser utilizados en otros módulos
module.exports = {
    pruebas,
    saveUser, 
    loginUser,
    updateUser,
    uploadImage,
    getImageFile,
};