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
        this.getData().then(response => response.json()).then(response => {
            response = JSON.parse(response);
            self.returnTemplate(response)
            
        })
        socket.on('status', (msg) => {
            document.getElementById("data").innerHTML += "<br /><h3>" + msg + "</h3>";
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
                    self.returnTemplate(response)
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
            document.getElementById("data").innerHTML += "<br /><br /><br /><b>ENTREPRISES  : </b><br /><br />"
            if(elem.content != undefined) {
                let eleme = JSON.parse(elem.content);
          
                eleme.forEach(element => {
                  
                    if(Array.isArray(element)) {
                        element.forEach(eleme => {
                            document.getElementById("data").innerHTML += "<br /><b>denomination : </b>" + eleme.denomination
                        })
                        
                    }
                    else {
                        if(element.nom != undefined) {
                            document.getElementById("data").innerHTML += "<br /><b>nom : </b>" + element.nom
                        }

                        if(element.nom_complet != undefined) {
                            document.getElementById("data").innerHTML += "<br /><b>nom_complet : </b>" + element.nom_complet
                        }

                        if(element.qualite != undefined) {
                            document.getElementById("data").innerHTML += "<br /><b>qualite : </b>" + element.qualite
                        }
                    }
                    if(element.resultats != undefined) {
                        element.resultats.forEach(elemento => {
                            document.getElementById("data").innerHTML += "<br />"
                            document.getElementById("data").innerHTML += "<br />"
                         
                            document.getElementById("data").innerHTML += "<br /><b>siren : " + elemento.siren
                            document.getElementById("data").innerHTML += "<br /><b>domaine_activite : </b>" + elemento.domaine_activite + "<br />"
                        })
                    }
                })   
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

