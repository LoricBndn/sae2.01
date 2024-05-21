import { connexion, APIsql } from "../modele/connexion.js"
class UnClient { // définition de la classe gérant les données d’un client
    private _idCli: string;
    private _civCli: string;
    private _nomCli: string;
    private _prenomCli: string;
    private _telCli: string;
    private _melCli: string;
    private _adrCli: string;
    private _cpCli: string;
    private _communeCli: string;
    private _tauxmaxRemiseCli: string;

    constructor(id_cli = "", civ_cli = "", nom_cli = "", prenom_cli = "", tel_cli = "", mel_cli = "", adr_cli = "", cp_cli = "", commune_cli = "", tauxmax_remise_cli = "") {
        // initialisation à l’instanciation
        this._idCli = id_cli;
        this._civCli = civ_cli;
        this._nomCli = nom_cli;
        this._prenomCli = prenom_cli;
        this._telCli = tel_cli;
        this._melCli = mel_cli;
        this._adrCli = adr_cli
        this._cpCli = cp_cli
        this._communeCli = commune_cli
        this._tauxmaxRemiseCli = tauxmax_remise_cli
    }

    // définition des « getters » et des « setters » pour la lecture/écriture des attributs privés de la classe
    get idCli(): string { return this._idCli; }
    set idCli(id_cli: string) { this._idCli = id_cli; }
    get civCli(): string { return this._civCli; }
    set civCli(civ_cli: string) { this._civCli = civ_cli; }
    get nomCli(): string { return this._nomCli; }
    set nomCli(nom_cli: string) { this._nomCli = nom_cli; }
    get prenomCli(): string { return this._prenomCli; }
    set prenomCli(prenom_cli: string) { this._prenomCli = prenom_cli; }
    get telCli(): string { return this._telCli; }
    set telCli(tel_cli: string) { this._telCli = tel_cli; }
    get melCli(): string { return this._melCli; }
    set melCli(mel_cli: string) { this._melCli = mel_cli; }
    get adrCli(): string { return this._adrCli; }
    set adrCli(adr_cli: string) { this._adrCli = adr_cli; }
    get cpCli(): string { return this._cpCli; }
    set cpCli(cp_cli: string) { this._cpCli = cp_cli; }
    get communeCli(): string { return this._communeCli; }
    set communeCli(commune_cli: string) { this._communeCli = commune_cli; }
    get tauxmaxRemiseCli(): string { return this._tauxmaxRemiseCli; }
    set tauxmaxRemiseCli(tauxmax_remise_cli: string) { this._tauxmaxRemiseCli = tauxmax_remise_cli; }


    toArray(): APIsql.TtabAsso { // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau: APIsql.TtabAsso = {
            idCli: this.idCli, 
            civCli: this.civCli,
            nomCli: this.nomCli, 
            prenomCli: this.prenomCli, 
            telCli: this.telCli, 
            melCli: this.melCli, 
            adrCli: this.adrCli, 
            cpCli: this.cpCli, 
            communeCli: this.communeCli, 
            tauxmaxRemiseCli: this.tauxmaxRemiseCli
        };
        return tableau;
    }
}

type TClients = {[key: string]: UnClient}; // tableau d’objets UnClient
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesClients { // définition de la classe gérant les données de la table client
    constructor () {
    // rien
    }

    idExiste(id_cli: string): boolean {
        // renvoie le test d’existence d’un client dans la table
        // sert pour l’ajout d’un nouveau client
        return (APIsql.sqlWeb.SQLloadData("SELECT id_cli FROM client WHERE id_cli=?"
            , [id_cli]).length > 0);
    }

    private load(result : APIsql.TdataSet) : TClients {
    // à partir d’un TdataSet, conversion en tableau d’objets UnClient
        const clients : TClients = {};
        for (let i=0; i<result.length; i++) {
            const item:APIsql.TtabAsso = result[i];
            const client = new UnClient(item['id_cli'], item['civ_cli'], item['nom_cli'], item['prenom_cli'], item['tel_cli'], item['mel_cli'], item['adr_cli'], item['cp_cli'], item['commune_cli'], item['tauxmax_remise_cli']);
            clients[client.idCli] = client; // clé d’un élément du tableau : id client
        }
        return clients;
    }

    private prepare(where:string):string { // préparation de la requête avec ou sans restriction (WHERE)
        let sql : string;
        sql = "SELECT id_cli, civ_cli, nom_cli, prenom_cli, tel_cli, mel_cli, adr_cli, cp_cli, commune_cli, tauxmax_remise_cli FROM client ";
        if (where !== "")
        {
            sql += " WHERE " +where;
        }
        return sql;
    }

    all() : TClients { // renvoie le tableau d’objets contenant tous les clients
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""),[]));
    }

    byIdCli(id_cli : string) : UnClient { // renvoie l’objet correspondant au département id_cli
        let client = new UnClient;
        const clients : TClients =
                        this.load(APIsql.sqlWeb.SQLloadData(this.prepare("id_cli = ?"),[id_cli]));
        const lesCles: string[] = Object.keys(clients);
        // affecte les clés du tableau associatif « clients » dans le tableau de chaines « lesCles »
        if ( lesCles.length > 0) {
            client = clients[lesCles[0]]; // récupérer le 1er élément du tableau associatif « clients »
        }
        return client;
    }
    
    toArray(clients : TClients) : APIsql.TdataSet {
    // renvoie le tableau d’objets sous la forme d’un tableau de tableaux associatifs
    // pour un affichage dans un tableau HTML
        let T:APIsql.TdataSet = [];
        for (let id in clients) {
            T.push(clients[id].toArray());
        }
        return T;
    }
}

export {connexion}
export {UnClient}
export {LesClients}
export {TClients}