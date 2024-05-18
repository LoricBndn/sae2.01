import { connexion, APIsql } from "../modele/connexion.js";
import { UneFacture } from "../modele/data_facture.js"

class UnTypProduit {
    private _codeProd: string;
    private _libProd: string;
    private _type: string;
    private _origine: string;
    private _conditionnement: string;
    private _tarifHt: string

    constructor(code_prod = "", lib_prod = "", type = "", origine = "", conditionnement = "", tarif_ht = "") {
        // initialisation à l’instanciation
        this._codeProd = code_prod;
        this._libProd = lib_prod;
        this._type = type;
        this._origine = origine;
        this._conditionnement = conditionnement;
        this._tarifHt = tarif_ht;
    }

    // définition des « getters » et des « setters » pour les attributs privés de la classe
    get codeProd(): string { return this._codeProd; }
    set codeProd(code_prod: string) { this._codeProd = code_prod; }
    get libProd(): string { return this._libProd; }
    set libProd(lib_prod: string) { this._libProd = lib_prod; }
    get type(): string { return this._type; }
    set type(type: string) { this._type = type; }
    get origine(): string { return this._origine; }
    set origine(origine: string) { this._origine = origine; }
    get conditionnement(): string { return this._conditionnement; }
    set conditionnement(conditionnement: string) { this._conditionnement = conditionnement; }
    get tarifHt(): string { return this._tarifHt; }
    set tarifHt(tarif_ht: string) { this._tarifHt = tarif_ht; }

    toArray(): APIsql.TtabAsso {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau: APIsql.TtabAsso = {
            codeProd: this._codeProd,
            libProd: this._libProd,
            type: this._type,
            origine: this._origine,
            conditionnement: this._conditionnement,
            tarifHt: this._tarifHt,
        };
        return tableau;
    }
}

type TTypProduits = { [key: string]: UnTypProduit }; // tableau d’objets UnTypProduit
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesTypProduits { // définition de la classe gérant les données de la table produit
    constructor() {
        // rien
    }

    private load(result: APIsql.TdataSet): TTypProduits {
        // à partir d’un TdataSet, conversion en tableau d’objets UnTypProduit
        let typProduits: TTypProduits = {};
        for (let i = 0; i < result.length; i++) {
            const item: APIsql.TtabAsso = result[i];
            const typProduit = new UnTypProduit(item['code_prod'], item['lib_prod'], item['type'], item['origine'], item['conditionnement'], item['tarif_ht']);
            typProduits[typProduit.codeProd] = typProduit;// clé d’un élément du tableau : id equipt
        }
        return typProduits;
    }

    private prepare(where: string): string { // préparation de la requête avec ou sans restriction (WHERE)
        let sql: string;
        sql = "SELECT code_prod, lib_prod, type, origine, conditionnement, tarif_ht";
        sql += " FROM produit"
        if (where.trim() !== "") {
            sql += " WHERE " + where;
        }
        sql += " ORDER BY lib_prod ASC ";
        return sql;
    }

    all(): TTypProduits { // renvoie le tableau d’objets contenant tous les produits
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }

    byCodeProd(code_prod: string): UnTypProduit { // renvoie l’objet correspondant à l’équipement code_prod
        let typProduit = new UnTypProduit;
        const typProduits: TTypProduits = this.load(APIsql.sqlWeb.SQLloadData
            (this.prepare("code_prod = ?"), [code_prod]));
        const lesCles: string[] = Object.keys(typProduits);
        // affecte les clés du tableau associatif « typProduits » dans le tableau de chaines « lesCles »
        if (lesCles.length > 0) {
            typProduit = typProduits[lesCles[0]]; // récupérer le 1er élément du tableau associatif « typProduits »
        }
        return typProduit;
    }

    toArray(typProduits: TTypProduits): APIsql.TdataSet { // renvoie le tableau d’objets sous la forme
        // d’un tableau de tableaux associatifs pour un affichage dans un tableau HTML
        let T: APIsql.TdataSet = [];
        for (let id in typProduits) {
            T.push(typProduits[id].toArray());
        }
        return T;
    }
}

class UnTypProduitByFacture {
    private _qteProd: number;
    private _unTypProduit: UnTypProduit;

    constructor(unTypProduit: UnTypProduit = null, qteProd = 0) {
        // attributs de produit auxquelles on ajouter l’attribut « qte » de la relation « ligne »
        this._unTypProduit = unTypProduit;
        this._qteProd = qteProd;
    }

    // définition des « getters » et des « setters » pour les attributs privés de la classe
    get qteProd(): number { return this._qteProd; }
    set qteProd(qteProd: number) { this._qteProd = qteProd; }
    get unTypProduit(): UnTypProduit { return this._unTypProduit; }
    set unTypProduit(unTypProduit: UnTypProduit) { this._unTypProduit = unTypProduit}

    toArray(): APIsql.TtabAsso {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau = this.unTypProduit.toArray(); // appel de la méthode « toArray » de « UnTypProduit »
        tableau['qte_prod'] = this.qteProd.toFixed(0);
        return tableau;
    }
}

type TTypProduitsByFacture = { [key: string]: UnTypProduitByFacture }; 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesTypProduitsByFacture {
    constructor() {
        // rien
    }

    private load(result: APIsql.TdataSet): TTypProduitsByFacture {
        // à partir d’un TdataSet, conversion en tableau d’objets UnTypProduitByFacture
        const typProduitsByFacture: TTypProduitsByFacture = {};
        const lesTypProduits = new LesTypProduits();
        for (let i = 0; i < result.length; i++) {
            const item: APIsql.TtabAsso = result[i];
            const UnTypProduit = lesTypProduits.byCodeProd(item['code_prod']);
            const typProduitByFacture = new UnTypProduitByFacture(UnTypProduit, parseInt(item['qte_prod']));
            typProduitsByFacture[typProduitByFacture.unTypProduit.codeProd] = typProduitByFacture;
        }
        return typProduitsByFacture;
    }

    private prepare(where: string): string {
        let sql: string;
        sql = "SELECT code_prod, qte_prod";
        sql += " FROM ligne";
        if (where.trim() !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }

    byNumFact(num_fact: string): TTypProduitsByFacture {
        // renvoie le tableau d’objets contenant tous les produits de la facture num fact
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?"), [num_fact]));
    }

    byNumFactureCodeProd(num_fact: string, code_prod: string): UnTypProduitByFacture {
        // renvoie l’objet de l’équipement code_prod contenu dans la salle num_fact
        let typProduitByFacture = new UnTypProduitByFacture;
        let typProduitsByFacture: TTypProduitsByFacture = this.load(APIsql.sqlWeb.SQLloadData
            (this.prepare("num_fact = ? and code_prod = ?"), [num_fact, code_prod]));
        if (!typProduitsByFacture[0] === undefined) {
            typProduitByFacture = typProduitsByFacture[0];
        }
        return typProduitByFacture;
    }

    toArray(typProduits: TTypProduitsByFacture): APIsql.TdataSet {
        let T: APIsql.TdataSet = [];
        for (let id in typProduits) {
            T.push(typProduits[id].toArray());
            delete T[T.length - 1].type; // pas besoin du type pour l'affichage dans le tableau
        }
        return T;
    }
    
    getMontantProduit(produit: UnTypProduitByFacture): number {
		// renvoie le montant Ã  payer pour un produit par rapport Ã  son tarif HT et sa qte
		const montantProduit = produit.qteProd * Number(produit.unTypProduit.tarifHt);
		return montantProduit;
	}

    getTotalMontantSansRemise(typProduits: TTypProduitsByFacture): number { 
        // renvoie le montant total d'une facture sans remise
        let totalHt = 0;
        for (let id in typProduits) {
            const produit = typProduits[id];
            totalHt += Number(produit.unTypProduit.tarifHt) * produit.qteProd;
        }
        return totalHt;
    }

    getTotalMontantAvecRemise(typProduits: TTypProduitsByFacture, uneFacture: UneFacture): number { 
        // renvoie le montant total d’une facture avec remise
        const totalHt = this.getTotalMontantSansRemise(typProduits);
        // Calcul du montant total de la remise sur la facture
        const totalRemise = this.getTotalMontantRemise(typProduits, uneFacture);
        const totalAPayer = totalHt - totalRemise;
        return totalAPayer;
        
    }

    getTotalMontantRemise(typProduits: TTypProduitsByFacture, uneFacture: UneFacture): number { 
        // renvoie le montant total de la remise sur la facture
        let totalRemise = 0;
        for (let id in typProduits) {
            // Calcul de la remise pour ce produit
            const remise = Number(typProduits[id].unTypProduit.tarifHt) * typProduits[id].qteProd * (Number(uneFacture.tauxRemiseFact) / 100);
            // Ajout de la remise au total
            totalRemise += remise;
        }
        return totalRemise;
    }

    delete(num_fact: string): boolean { // requête de suppression des produits d’une facture dans «ligne»
        let sql: string;
        sql = "DELETE FROM ligne WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]); // requête de manipulation : utiliser SQLexec
    }

    insert(num_fact: string, typProduits: TTypProduitsByFacture): boolean {
        // requête d’ajout des produits avec une quantité dans « ligne » installé dans « num_fact »
        let sql: string;
        let separateur = "";
        sql = "INSERT INTO ligne(num_fact, code_prod, qte_prod) VALUES ";
        for (let cle in typProduits) {
            sql += separateur + "('" + num_fact + "','" + typProduits[cle].unTypProduit.codeProd + "','"
                + typProduits[cle].qteProd + "')";
            separateur = ",";
        }
        return APIsql.sqlWeb.SQLexec(sql, []);
    }
}

export { connexion }
export { UnTypProduit }
export { LesTypProduits }
export { TTypProduits }
export { UnTypProduitByFacture }
export { LesTypProduitsByFacture }
export { TTypProduitsByFacture }
