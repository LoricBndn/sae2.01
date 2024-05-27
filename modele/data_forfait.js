import { connexion, APIsql } from "./connexion.js";
class UnForfait {
    constructor(id_forfait = "", lib_forfait = "", mt_forfait = "") {
        // initialisation à l’instanciation
        this._idForfait = id_forfait;
        this._libForfait = lib_forfait;
        this._mtForfait = mt_forfait;
    }
    // définition des « getters » et des « setters » pour la lecture/écriture des attributs privés de la classe
    get idForfait() { return this._idForfait; }
    set idForfait(id_forfait) { this._idForfait = id_forfait; }
    get libForfait() { return this._libForfait; }
    set libForfait(lib_forfait) { this._libForfait = lib_forfait; }
    get mtForfait() { return this._mtForfait; }
    set mtForfait(mt_forfait) { this._mtForfait = mt_forfait; }
    toArray() {
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau = { 'idForfait': this.idForfait, 'libForfait': this.libForfait,
            'mtForfait': this.mtForfait };
        return tableau;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesForfaits {
    constructor() {
        // rien
    }
    load(result) {
        // à partir d’un TdataSet, conversion en tableau d’objets UnForfait
        const forfaits = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const forfait = new UnForfait(item['id_forfait'], item['lib_forfait'], item['mt_forfait']);
            forfaits[forfait.idForfait] = forfait; // clé d’un élément du tableau : id forfait
        }
        return forfaits;
    }
    prepare(where) {
        let sql;
        sql = "SELECT id_forfait, lib_forfait, mt_forfait FROM forfait_livraison ";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    byIdForfait(id_forfait) {
        let forfait = new UnForfait;
        const forfaits = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("id_forfait = ?"), [id_forfait]));
        const lesCles = Object.keys(forfaits);
        // affecte les clés du tableau associatif « forfaits » dans le tableau de chaines « lesCles »
        if (lesCles.length > 0) {
            forfait = forfaits[lesCles[0]]; // récupérer le 1er élément du tableau associatif « forfaits »
        }
        return forfait;
    }
    toArray(forfaits) {
        // renvoie le tableau d’objets sous la forme d’un tableau de tableaux associatifs
        // pour un affichage dans un tableau HTML
        let T = [];
        for (let id in forfaits) {
            T.push(forfaits[id].toArray());
        }
        return T;
    }
}
export { connexion };
export { UnForfait };
export { LesForfaits };
//# sourceMappingURL=data_forfait.js.map