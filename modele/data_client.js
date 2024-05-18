import { connexion, APIsql } from "../modele/connexion.js";
class UnClient {
    constructor(id_cli = "", civ_cli = "", nom_cli = "", prenom_cli = "", tel_cli = "", mel_cli = "", adr_cli = "", cp_cli = "", commune_cli = "", tauxmax_remise_cli = "") {
        // initialisation à l’instanciation
        this._idCli = id_cli;
        this._civCli = civ_cli;
        this._nomCli = nom_cli;
        this._prenomCli = prenom_cli;
        this._telCli = tel_cli;
        this._melCli = mel_cli;
        this._adrCli = adr_cli;
        this._cpCli = cp_cli;
        this._communeCli = commune_cli;
        this._tauxmaxRemiseCli = tauxmax_remise_cli;
    }
    // définition des « getters » et des « setters » pour la lecture/écriture des attributs privés de la classe
    get idCli() { return this._idCli; }
    set idCli(id_cli) { this._idCli = id_cli; }
    get civCli() { return this._civCli; }
    set civCli(civ_cli) { this._civCli = civ_cli; }
    get nomCli() { return this._nomCli; }
    set nomCli(nom_cli) { this._nomCli = nom_cli; }
    get prenomCli() { return this._prenomCli; }
    set prenomCli(prenom_cli) { this._prenomCli = prenom_cli; }
    get telCli() { return this._telCli; }
    set telCli(tel_cli) { this._telCli = tel_cli; }
    get melCli() { return this._melCli; }
    set melCli(mel_cli) { this._melCli = mel_cli; }
    get adrCli() { return this._adrCli; }
    set adrCli(adr_cli) { this._adrCli = adr_cli; }
    get cpCli() { return this._cpCli; }
    set cpCli(cp_cli) { this._cpCli = cp_cli; }
    get communeCli() { return this._communeCli; }
    set communeCli(commune_cli) { this._communeCli = commune_cli; }
    get tauxmaxRemiseCli() { return this._tauxmaxRemiseCli; }
    set tauxmaxRemiseCli(tauxmax_remise_cli) { this._tauxmaxRemiseCli = tauxmax_remise_cli; }
    toArray() {
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau = {
            'idCli': this.idCli, 'civCli': this.civCli,
            'nomCli': this.nomCli, 'prenomCli': this.prenomCli,
            'telCli': this.telCli, 'melCli': this.melCli,
            'adrCli': this.adrCli, 'cpCli': this.cpCli,
            'communeCli': this.communeCli, 'tauxmaxRemiseCli': this.tauxmaxRemiseCli
        };
        return tableau;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesClients {
    constructor() {
        // rien
    }
    idExiste(id_cli) {
        // renvoie le test d’existence d’un client dans la table
        // sert pour l’ajout d’un nouveau client
        return (APIsql.sqlWeb.SQLloadData("SELECT id_cli FROM client WHERE id_cli=?", [id_cli]).length > 0);
    }
    load(result) {
        // à partir d’un TdataSet, conversion en tableau d’objets UnClient
        const clients = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const client = new UnClient(item['id_cli'], item['civ_cli'], item['nom_cli'], item['prenom_cli'], item['tel_cli'], item['mel_cli'], item['adr_cli'], item['cp_cli'], item['commune_cli'], item['tauxmax_remise_cli']);
            clients[client.idCli] = client; // clé d’un élément du tableau : id client
        }
        return clients;
    }
    prepare(where) {
        let sql;
        sql = "SELECT id_cli, civ_cli, nom_cli, prenom_cli, tel_cli, mel_cli, adr_cli, cp_cli, commune_cli, tauxmax_remise_cli FROM client ";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    byIdClient(id_cli) {
        let client = new UnClient;
        const clients = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("id_cli = ?"), [id_cli]));
        const lesCles = Object.keys(clients);
        // affecte les clés du tableau associatif « clients » dans le tableau de chaines « lesCles »
        if (lesCles.length > 0) {
            client = clients[lesCles[0]]; // récupérer le 1er élément du tableau associatif « clients »
        }
        return client;
    }
    toArray(clients) {
        // renvoie le tableau d’objets sous la forme d’un tableau de tableaux associatifs
        // pour un affichage dans un tableau HTML
        let T = [];
        for (let id in clients) {
            T.push(clients[id].toArray());
        }
        return T;
    }
}
export { connexion };
export { UnClient };
export { LesClients };
//# sourceMappingURL=data_client.js.map