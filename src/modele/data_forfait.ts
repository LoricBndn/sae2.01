import {connexion, APIsql} from "../modele/connexion.js"
class UnForfait { // définition de la classe gérant les données d’un forfait
    private _idForfait: string;
    private _libForfait : string;
    private _mtForfait : string;

    constructor(id_forfait = "", lib_forfait ="" , mt_forfait = "" ) {
    // initialisation à l’instanciation
        this._idForfait = id_forfait;
        this._libForfait = lib_forfait;
        this._mtForfait  = mt_forfait;
    }

    // définition des « getters » et des « setters » pour la lecture/écriture des attributs privés de la classe
    get idForfait():string { return this._idForfait; }
    set idForfait ( id_forfait : string ) { this._idForfait = id_forfait; }
    get libForfait():string { return this._libForfait; }
    set libForfait ( lib_forfait : string ) { this._libForfait = lib_forfait; }
    get mtForfait():string { return this._mtForfait; }
    set mtForfait ( mt_forfait : string ) { this._mtForfait = mt_forfait; }

    toArray():APIsql.TtabAsso { // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau : APIsql.TtabAsso = {
            idForfait:this.idForfait, 
            libForfait:this.libForfait,
            mtForfait:this.mtForfait 
        };
        return tableau;
    }
}

type TForfaits = {[key: string]: UnForfait}; // tableau d’objets UnForfait
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesForfaits { // définition de la classe gérant les données de la table forfait_livraison
    constructor () {
    // rien
    }

    private load(result : APIsql.TdataSet) : TForfaits {
    // à partir d’un TdataSet, conversion en tableau d’objets UnForfait
        const forfaits : TForfaits = {};
        for (let i=0; i<result.length; i++) {
            const item:APIsql.TtabAsso = result[i];
            const forfait = new UnForfait(item['id_forfait'], item['lib_forfait'], item['mt_forfait']);
            forfaits[forfait.idForfait] = forfait; // clé d’un élément du tableau : id forfait
        }
        return forfaits;
    }

    private prepare(where:string):string { // préparation de la requête avec ou sans restriction (WHERE)
        let sql : string;
        sql = "SELECT id_forfait, lib_forfait, mt_forfait FROM forfait_livraison ";
        if (where !== "")
        {
            sql += " WHERE " +where;
        }
        return sql;
    }

    all() : TForfaits { // renvoie le tableau d’objets contenant tous les forfaits
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""),[]));
    }

    byIdForfait(id_forfait : string) : UnForfait { // renvoie l’objet correspondant au département id_forfait
        let forfait = new UnForfait;
        const forfaits : TForfaits =
                        this.load(APIsql.sqlWeb.SQLloadData(this.prepare("id_forfait = ?"),[id_forfait]));
        const lesCles: string[] = Object.keys(forfaits);
        // affecte les clés du tableau associatif « forfaits » dans le tableau de chaines « lesCles »
        if ( lesCles.length > 0) {
            forfait = forfaits[lesCles[0]]; // récupérer le 1er élément du tableau associatif « forfaits »
        }
        return forfait;
    }
    
    toArray(forfaits : TForfaits) : APIsql.TdataSet {
    // renvoie le tableau d’objets sous la forme d’un tableau de tableaux associatifs
    // pour un affichage dans un tableau HTML
        let T:APIsql.TdataSet = [];
        for (let id in forfaits) {
            T.push(forfaits[id].toArray());
        }
        return T;
    }
}

export {connexion}
export {UnForfait}
export {LesForfaits}
export {TForfaits}