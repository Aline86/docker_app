# Ce projet permet de récupérer les informations entreprises sur le site Pappers, de les poster sur un Webhook et de les récupérer sur le front présent dans le repo

Projet effectué avec docker
3 services créés :
- nginx pour le frontend
- mysql pour la bdd
- nodeJS pour le backend

Utilisatisation de socket.io sur l'app

Pour rendre le projet fonctionnel il faut 
- créer un compte papers : https://www.pappers.fr/
    - récupérer le token API
    - la mettre dans le .env
- récupérer une url de webhook public [webhook.site](https://webhook.site)
    - récupérer la token et l'id
    - les mettre dans le .env
- squelette de connexion à une bdd créé :
    - il faut renseigner les infos du .env concernant la bdd
    
Pour run le projet, il faut taper les lignes suivantes
- docker-compose build
- docker-compose up
à la racine du projet

  
