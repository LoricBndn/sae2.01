import * as APIsql from "./sqlWeb.js"

APIsql.sqlWeb.init("https://devweb.iutmetz.univ-lorraine.fr/~bondon3u/1A/SAE%202.01/vue/","https://devweb.iutmetz.univ-lorraine.fr/~nitschke5/ihm/IHM_API/")

class Connexion {
	constructor() {
		this.init();
	}
	init():void {
		// à adapter avec voter nom de base et vos identifiants de connexion
		APIsql.sqlWeb.bdOpen('devbdd.iutmetz.univ-lorraine.fr','3306','bondon3u_sae201', 'bondon3u_appli','Loric#2302!', 'utf8');
	}
}
let connexion = new Connexion;

export {connexion, APIsql}

