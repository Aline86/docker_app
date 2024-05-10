console.log('toto')

import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
let serverAddress = "ws://127.0.0.1:447";

const socket = io(serverAddress);
class FirmData {
   
    getProgress = async () => {
        socket.connect("ws://127.0.0.1:447/socket.io/", {
           // path: `/progress`,
            autoConnect: true,
            credentials: true,
            auth: {
                token:
                document.cookie
                    .split("; ")
                    .find(x => x.startsWith("snet-token="))
                    ?.split("=")[1] ?? "",
            },
            transports: ['websocket']
        });
    }
        
    getData = async () => 
        await fetch(`http://localhost:3000/main/`)

    getFirm = async (name) => 
        await fetch(`http://localhost:3000/firm/${name}`)
        

    returnData = () => {
        self = this
        socket.on('status', (msg) => {
            document.getElementById("data").innerHTML += "<br /><h3>" + msg + "</h3>";
        })
        this.getData().then(response => response.json()).then(response => {
            response = JSON.parse(response);
            
            self.returnTemplate(response)
            
        })
       
    }

    getFirmData = () => {
        self = this
        socket.on('status', (msg) => {
            console.log(msg)
            document.getElementById("progress").innerHTML += "<br /><h3>" + msg + "</h3>";
        })
        document.getElementById("button_click_name").addEventListener("click", function(e){
            if(document.getElementById("input_name").value.length === 9) {
                document.getElementById("data").innerHTML = "" 
                self.getFirm(document.getElementById("input_name").value).then(response => response.json()).then(response => {
                    response = JSON.parse(response);
                    self.returnTemplate(response);
                })
            }
        })
    } 

    emptyDivs = () => {
        document.getElementById("input_value").innerHTML = ""
        document.querySelector(".card-container").innerHTML = ""
    }
    // traintement de l'affichage du retour API
    returnTemplate = (response) => {
        response.data.forEach(elem => {
            document.getElementById("data").innerHTML += "<br />"
            document.getElementById("data").innerHTML += "<br />"
            document.getElementById("data").innerHTML += "<br />----------------------------------------------------------------------------------------------------------------------------------------------------"
            document.getElementById("data").innerHTML += "<br />----------------------------------------------------------------------------------------------------------------------------------------------------"
            console.log(elem)
            if(elem.content != undefined) {
                let base = JSON.parse(elem.content)
                let data_first_query = base.query_firm;

                document.getElementById("data").innerHTML += "<br />"
                document.getElementById("data").innerHTML += "<br />"
             
                document.getElementById("data").innerHTML += "<br /><b>siren : " + data_first_query.siren
                document.getElementById("data").innerHTML += "<br /><b>domaine_activite : </b>" + data_first_query.domaine_activite + "<br />"
                document.getElementById("data").innerHTML += "<br /><b>denomination : </b>" + data_first_query.denomination
                if(base.directors != undefined) {
                    base.directors.forEach(directordata => {
                        document.getElementById("data").innerHTML += "<br />"
                        document.getElementById("data").innerHTML += "<br />---------------------------------------------------------"
                        document.getElementById("data").innerHTML += "<br />"
                        if(directordata.nom != undefined) {
                            document.getElementById("data").innerHTML += "<br /><b>nom : </b>" + directordata.nom
                        }
                        if(directordata.nom_complet != undefined) {
                            document.getElementById("data").innerHTML += "<br /><b>nom_complet : </b>" + directordata.nom_complet
                        }
                        if(directordata.qualite != undefined) {
                            document.getElementById("data").innerHTML += "<br /><b>qualite : </b>" + directordata.qualite
                        }
                        if(directordata.resultats  != undefined) {
                            document.getElementById("data").innerHTML += "<br /><br /><b>ENTREPRISES  : </b><br /><br />"
                            directordata.resultats.forEach(directorentreprise => {
                                if(directorentreprise.siren != undefined) {
                                    document.getElementById("data").innerHTML += "<br /><b>siren : </b>" + directorentreprise.siren
                                }
                                if(directorentreprise.denomination != undefined) {
                                    document.getElementById("data").innerHTML += "<br /><b>denomination : </b>" + directorentreprise.denomination
                                }
                                if(directorentreprise.domaine_activite != undefined) {
                                    document.getElementById("data").innerHTML += "<br /><b>domaine_activite : </b>" + directorentreprise.domaine_activite
                                }
                            })
                        }
                    })
                }
            }
        })      
    }
}
const firmData = new FirmData();
window.onload = function() {
    firmData.getProgress();
    firmData.returnData();
    firmData.getFirmData();
}

