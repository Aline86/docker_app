const http = require('http'); 
const express = require('express');
const mysql = require('mysql2');
const { insertQuery } = require("../db/loadquery")
const { ResultsData } = require('../models/resultdata');
const { webhookID, webhookToken, pappersToken, db_host, db_name, db_username, db_password} = require('../config');
const db = mysql.createConnection({ host: db_host,   user: db_password,   password: db_username , database: db_name});
const app = express();
const { Server } = require('socket.io');


// Connection au tunnel socket pour l'envoi des statuts des requêtes
const io = new Server(447, {
    cors: {
        origins: '*:*',
    },
  });
const connections = [];
io.sockets.on("connection", socket => {
    connections.push(socket);
    socket.emit('status', 'connection to socket ok');
    socket.on("disconnect", () => {
        connections.splice(connections.indexOf(socket), 1);
    });
});
io.sockets.setMaxListeners(9000);

// Récupérartion des datas postées sur le webhook
exports.getData = async (req, res) => {
    try {
        io.emit('status', 'start getFirmDataFromHook http request : status in progress.');
        const request = await http.get('http://webhook.site/token/'+ webhookToken + '/requests', (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                res.send(JSON.stringify(data));
                io.emit('status', 'returnFirmDataFromHookToFront http request : status finished.');
            
            })
        })

        // Log errors if any occur
        request.on('error', (error) => {
            console.error(error);
        });
    
        // End the request
        request.end();
    } catch(err) {
        console.log(err)
        res.status(400).json({
            err: err.message
        })
    }
}

// Récupérations des données des dirigeants de l'entreprises // Je n'ai pas trouvé les infos relatives aux employés
getFirmDataFromHook = async (res) => {
    try {
        io.emit('status', 'start getFirmDataFromHook http request : status in progress.');
        const request = await http.get('http://webhook.site/token/'+ webhookToken +'/requests', (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                res.send(JSON.stringify(data));
                io.emit('status', 'returnFirmDataFromHookToFront http request : status finished.');
            })
        })

        // Log errors if any occur
        request.on('error', (error) => {
            console.error(error);
        });
    
        // End the request
        request.end();
    } catch(err) {
        console.log(err)
        res.status(400).json({
            err: err.message
        })
    }
}
// Code pour évolution du projet, test pour mettre en bdd // méthode non utilisée dans le cas présent
postToBDD = async (data) => {
    await db.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
            db.query("SELECT * FROM firm WHERE siren = " + data.siren, function (err, result, fields) {
                if (err) throw err;
                console.log(result);
                if((Array.isArray(result) && result.length === 0 ) || result === '' || result === false) {

                    var sql = insertQuery
                  
                    db.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("1 record inserted");
                    });
                }  
            })
    })
}

// Une fois toutes les infos entreprises dirigeants récupérées je les poste sur le webhook
postFirmDataToHook = async (req, res) => {
    try {  
        const response = await fetch('https://webhook.site/'+ webhookToken +'/'+ webhookID, {
            method: "POST", 
            mode: "no-cors", 
            cache: "no-cache", 
    
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", 
            referrerPolicy: "no-referrer", 
            body: JSON.stringify(req), 
          });
        getFirmDataFromHook(res);
    } catch(err) {
        console.log(err)
    }
}

// Récupération des data entreprises 
exports.getFirmDataFromAPI = async (req, res) => {
    io.emit('status', 'start getFirmDataFromAPI http request : status in progress.');
    fetch('https://api.pappers.fr/v2/recherche?' + new URLSearchParams({
        api_token: pappersToken,
        siren: req.params.name
    }).toString(),  {
        method: "GET", 
        mode: "no-cors", 
        cache: "no-cache", 
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
      }).then(response => response.json())
      .then(data => {
            data.resultats.forEach(data => {
            getFirmDataManagersFromAPI(data, req, res)
        }) 
    })
      .catch(err => console.error(err));
  };

getFirmDataManagersFromAPI = async (data_begin, req, res) => {
    let data_array = [];
    
    let resultArray = new ResultsData(data_begin);

    // envoi du statut de la requête http via le socket au front
    io.emit('status', 'start getFirmDataManagersFromAPI http request : status in progress.');

    fetch('https://api.pappers.fr/v2/recherche-dirigeants?' + new URLSearchParams({
        api_token: pappersToken,
        siren: data_begin.siren
    }).toString(),  {
        method: "GET", 
        mode: "no-cors", 
        cache: "no-cache", 
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
      }).then(response => response.json())
      .then(data => {

        getManagerFirms(data, res, resultArray)
    })
    .catch(err => console.error(err));
}


getManagerFirms = async (data_begin, res, entreprise_racine_array) => {
    io.emit('status', 'start getFirmDataManagersFromAPI http request : status in progress.');
    resultSendTooHook(data_begin, entreprise_racine_array, res);
}

resultSendTooHook = async (data_begin, entreprise_racine_array, res) => {
    let promises = [];
    entreprise_racine_array.directors = []

    //dataPromiseResult.push(entreprise_racine_array)
    data_begin.resultats.forEach(elem => { elem 
        // code qui fait en sorte d'attendre que toutes les requêtes soient exécutées avant de poster le résultat sur le webhook
        promises.push(
            fetch('https://api.pappers.fr/v2/recherche?' + new URLSearchParams({
                api_token: pappersToken,
                nom_dirigeant: elem.nom,
                prenom_dirigeant: elem.prenom
            }).toString(),  {
                method: "GET", 
                mode: "no-cors", 
                cache: "no-cache", 
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: "follow", 
                referrerPolicy: "no-referrer", 
            }).then(response => response.json())
            .then(data_child => {
                
                entreprise_racine_array.directors.push(elem)
                entreprise_racine_array.directors.push(data_child)
               // result.push(data_child)
            })
        )
    })
    
    Promise.all(
        promises
    )
    .then((results) => {
        postFirmDataToHook(entreprise_racine_array, res)
    })
    .catch((error) => {
        console.log(error)
    });
}
