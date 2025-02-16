import { connexion, APIsql } from "./connexion.js"
class UneFacture {
    private _numFact: string;
    private _dateFact: string;
    private _commentFact: string;
    private _tauxRemiseFact: string;
    private _idCli: string;
    private _idForfait: string;

    constructor(num_fact = "", date_fact = "", comment_fact = "", taux_remise_fact = "", id_cli = "", id_forfait = "") {
        this._numFact = num_fact;
        this._dateFact = date_fact;
        this._commentFact = comment_fact;
        this._tauxRemiseFact = taux_remise_fact;
        this._idCli = id_cli;
        this._idForfait = id_forfait;
    }

    // définition des « getters » et des « setters » pour les attributs privés de la classe
    get numFact(): string { return this._numFact; }
    set numFact(num_fact: string) { this._numFact = num_fact; }
    get dateFact(): string { return this._dateFact; }
    set dateFact(date_fact: string) { this._dateFact = date_fact; }
    get commentFact(): string { return this._commentFact; }
    set commentFact(comment_fact: string) { this._commentFact = comment_fact; }
    get tauxRemiseFact(): string { return this._tauxRemiseFact; }
    set tauxRemiseFact(taux_remise_fact: string) { this._tauxRemiseFact = taux_remise_fact; }
    get idCli(): string { return this._idCli; }
    set idCli(id_cli: string) { this._idCli = id_cli; }
    get idForfait(): string { return this._idForfait; }
    set idForfait(id_forfait: string) { this._idForfait = id_forfait; }

    toArray(): APIsql.TtabAsso {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        const tableau: APIsql.TtabAsso = {
            'numFact': this._numFact, 'dateFact': this._dateFact
            , 'commentFact': this._commentFact, 'tauxRemiseFact': this._tauxRemiseFact
            , 'idCli': this._idCli, 'idForfait': this._idForfait
        };
        return tableau;
    }

    estDateValide(dateString: string): boolean {	//VÃ©rifie Ã  partir d'une string d'une date au format jj/mm/aaaa si celle-ci est valide
		const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    	const match = dateString.match(regex);
		if (!match) {
			return false;
		}
		
		// Extraire le jour, le mois et l'annÃ©e
		const day = parseInt(match[1], 10);
		const month = parseInt(match[2], 10);
		const year = parseInt(match[3], 10);
	
		// Les mois en JavaScript sont de 0 (janvier) Ã  11 (dÃ©cembre)
		const date = new Date(year, month - 1, day);
	
		// VÃ©rifier si la date est valide
		return (
			date.getFullYear() === year &&
			date.getMonth() === month - 1 &&
			date.getDate() === day
		);
	}
}

type TFactures = { [key: string]: UneFacture }; // tableau d’objets UneFacture
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesFactures { // définition de la classe gérant les données de la table facture
    constructor() { // rien
    }

    idExiste(num_fact: string): boolean {
        // renvoie le test d’existence d’une facture dans la table
        // sert pour l’ajout d’une nouvelle facture
        return (APIsql.sqlWeb.SQLloadData("SELECT num_fact FROM facture WHERE num_fact=?"
            , [num_fact]).length > 0);
    }

    private load(result: APIsql.TdataSet): TFactures {
        // à partir d’un TdataSet, conversion en tableau d’objets UneFacture
        let factures: TFactures = {};
        for (let i = 0; i < result.length; i++) {
            const item: APIsql.TtabAsso = result[i];
            const facture = new UneFacture(item['num_fact'], item['date_fact'], item['comment_fact'], item['taux_remise_fact'], item['id_cli'], item['id_forfait']);
            factures[facture.numFact] = facture; // clé d’un élément du tableau : num fact
        }
        return factures;
    }

    private prepare(where: string): string { // préparation de la requête avec ou sans restriction (WHERE)
        let sql: string;
        sql = "SELECT num_fact, date_fact, comment_fact, taux_remise_fact, id_cli, id_forfait ";
        sql += " FROM facture";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }

    all(): TFactures {// renvoie le tableau d’objets contenant toutes les factures
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }

    byNumFact(num_fact: string): UneFacture { // renvoie l’objet correspondant à la facture num_fact
        let facture = new UneFacture;
        const factures: TFactures = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?")
            , [num_fact]));
        const lesCles: string[] = Object.keys(factures);
        // affecte les clés du tableau associatif « factures » dans le tableau de chaines « lesCles »
        if (lesCles.length > 0) {
            facture = factures[lesCles[0]]; // récupérer le 1er élément du tableau associatif « factures »
        }
        return facture;
    }

    toArray(factures: TFactures): APIsql.TdataSet { // renvoie le tableau d’objets sous la forme
        // d’un tableau de tableaux associatifs pour un affichage dans un tableau HTML
        let T: APIsql.TdataSet = [];
        for (let id in factures) {
            T.push(factures[id].toArray());
        }
        return T;
    }

    delete(num_fact: string): boolean { // requête de suppression d’une facture dans la table
        let sql: string;
        sql = "DELETE FROM facture WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]); // requête de manipulation : utiliser SQLexec
    }

    insert(facture : UneFacture):boolean {	// requête d'ajout d'une facture dans la table
		let sql : string; // requête de manipulation : utiliser SQLexec
		sql	= "INSERT INTO facture(num_fact, date_fact,	comment_fact, taux_remise_fact, id_cli, id_forfait ) VALUES	(?, ?, ?, ?, ?, ?)";
		return APIsql.sqlWeb.SQLexec(sql,[facture.numFact, this.convertDateToEnglish(facture.dateFact), facture.commentFact, facture.tauxRemiseFact, facture.idCli, facture.idForfait]); 	
	}

	update(facture : UneFacture):boolean {		// requête de modification d'une facture dans la table
		let sql : string;
		sql	= "UPDATE facture SET date_fact = ?, comment_fact = ?, taux_remise_fact = ?, id_cli = ?, id_forfait = ? ";
		sql += " WHERE	 num_fact	= ?"; 	// requête de manipulation : utiliser SQLexec
		return APIsql.sqlWeb.SQLexec(sql,[this.convertDateToEnglish(facture.dateFact), facture.commentFact, facture.tauxRemiseFact, facture.idCli, facture.idForfait, facture.numFact]); 	
	}

    numDerniereFacture(listeFactures: TFactures): number {
		// Renvoie le numéro de la dernière facture
		let numero = 0;
		for (let i in listeFactures) {
		  const facture = listeFactures[i];
		  if (!facture) {
			break; //Si la facture n'existe pas, on a atteint la fin du tableau
		  }
		  numero = Number(facture.numFact);
		}
		return numero;
	}

    dateDuJour(): string {
		// Renvoie la date du jour au format jj/mm/aaaa
		const dateDuJour = new Date();

		const jour = dateDuJour.getDate(); // Obtiens le jour du mois (1-31)
		const mois = dateDuJour.getMonth() + 1; // Obtiens le mois (0-11) donc on y ajoute 1
		const annee = dateDuJour.getFullYear(); // Obtiens l'année complète (aaaa)

		// Formatage de la date du jour
		const dateFormatee = `${jour < 10 ? '0' : ''}${jour}/${mois < 10 ? '0' : ''}${mois}/${annee}`;

		return dateFormatee;
	}

    convertDateToFrench(dateStr: string): string {
        const [annee, mois, jour] = dateStr.split('-');
        return `${jour}/${mois}/${annee}`;
    }

    convertDateToEnglish(dateStr: string): string {
        const [jour, mois, annee] = dateStr.split('/');
        return `${annee}-${mois}-${jour}`;
    }
}
export { connexion }
export { UneFacture }
export { LesFactures }
export { TFactures }