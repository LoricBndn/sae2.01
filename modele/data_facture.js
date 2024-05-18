import { connexion, APIsql } from "./connexion.js";
class UneFacture {
    constructor(num_fact = "", date_fact = "", comment_fact = "", taux_remise_fact = "", id_cli = "", id_forfait = "") {
        this._numFact = num_fact;
        this._dateFact = date_fact;
        this._commentFact = comment_fact;
        this._tauxRemiseFact = taux_remise_fact;
        this._idCli = id_cli;
        this._idForfait = id_forfait;
    }
    // définition des « getters » et des « setters » pour les attributs privés de la classe
    get numFact() { return this._numFact; }
    set numFact(num_fact) { this._numFact = num_fact; }
    get dateFact() { return this._dateFact; }
    set dateFact(date_fact) { this._dateFact = date_fact; }
    get commentFact() { return this._commentFact; }
    set commentFact(comment_fact) { this._commentFact = comment_fact; }
    get tauxRemiseFact() { return this._tauxRemiseFact; }
    set tauxRemiseFact(taux_remise_fact) { this._tauxRemiseFact = taux_remise_fact; }
    get idCli() { return this._idCli; }
    set idCli(id_cli) { this._idCli = id_cli; }
    get idForfait() { return this._idForfait; }
    set idForfait(id_forfait) { this._idForfait = id_forfait; }
    toArray() {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        const tableau = {
            'numFact': this._numFact, 'dateFact': this._dateFact,
            'commentFact': this._commentFact, 'tauxRemiseFact': this._tauxRemiseFact,
            'idCli': this._idCli, 'idForfait': this._idForfait
        };
        return tableau;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesFactures {
    constructor() {
    }
    idExiste(num_fact) {
        // renvoie le test d’existence d’une facture dans la table
        // sert pour l’ajout d’une nouvelle facture
        return (APIsql.sqlWeb.SQLloadData("SELECT num_fact FROM facture WHERE num_fact=?", [num_fact]).length > 0);
    }
    load(result) {
        // à partir d’un TdataSet, conversion en tableau d’objets UneFacture
        let factures = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const facture = new UneFacture(item['num_fact'], item['date_fact'], item['comment_fact'], item['taux_remise_fact'], item['id_cli'], item['id_forfait']);
            factures[facture.numFact] = facture; // clé d’un élément du tableau : num fact
        }
        return factures;
    }
    prepare(where) {
        let sql;
        sql = "SELECT num_fact, date_fact, comment_fact, taux_remise_fact, id_cli, id_forfait ";
        sql += " FROM facture";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    byNumFacture(num_fact) {
        let facture = new UneFacture;
        const factures = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?"), [num_fact]));
        const lesCles = Object.keys(factures);
        // affecte les clés du tableau associatif « factures » dans le tableau de chaines « lesCles »
        if (lesCles.length > 0) {
            facture = factures[lesCles[0]]; // récupérer le 1er élément du tableau associatif « factures »
        }
        return facture;
    }
    toArray(factures) {
        // d’un tableau de tableaux associatifs pour un affichage dans un tableau HTML
        let T = [];
        for (let id in factures) {
            T.push(factures[id].toArray());
        }
        return T;
    }
    delete(num_fact) {
        let sql;
        sql = "DELETE FROM facture WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]); // requête de manipulation : utiliser SQLexec
    }
    insert(facture) {
        let sql; // requête de manipulation : utiliser SQLexec
        sql = "INSERT INTO facture(num_fact, date_fact, comment_fact, taux_remise_fact, id_cli, id_forfait) VALUES (?, ?, ?, ?, ?)";
        return APIsql.sqlWeb.SQLexec(sql, [facture.numFact, facture.commentFact, facture.dateFact, facture.tauxRemiseFact, facture.idCli, facture.idForfait]);
    }
    update(facture) {
        let sql;
        sql = "UPDATE facture SET date_fact = ?, comment_fact = ?, taux_remise_fact = ?, id_cli = ?, id_forfait = ? ";
        sql += " WHERE num_fact = ?"; // requête de manipulation : utiliser SQLexec
        return APIsql.sqlWeb.SQLexec(sql, [facture.dateFact, facture.commentFact, facture.tauxRemiseFact, facture.idCli, facture.idForfait]);
    }
}
export { connexion };
export { UneFacture };
export { LesFactures };
//# sourceMappingURL=data_facture.js.map