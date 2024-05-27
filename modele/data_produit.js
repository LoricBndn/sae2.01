import { connexion, APIsql } from "./connexion.js";
class UnTypProduit {
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
    get codeProd() { return this._codeProd; }
    set codeProd(code_prod) { this._codeProd = code_prod; }
    get libProd() { return this._libProd; }
    set libProd(lib_prod) { this._libProd = lib_prod; }
    get type() { return this._type; }
    set type(type) { this._type = type; }
    get origine() { return this._origine; }
    set origine(origine) { this._origine = origine; }
    get conditionnement() { return this._conditionnement; }
    set conditionnement(conditionnement) { this._conditionnement = conditionnement; }
    get tarifHt() { return this._tarifHt; }
    set tarifHt(tarif_ht) { this._tarifHt = tarif_ht; }
    toArray() {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau = {
            codeProd: this._codeProd,
            libProd: this._libProd,
            type: this._type,
            origine: this._origine,
            conditionnement: this._conditionnement,
            tarifHt: this._tarifHt,
        };
        return tableau;
    }
    getMontantProduit(typProduitByFacture) {
        // renvoie le montant à payer pour un produit par rapport à son prix unitaire et sa qte
        const montantProduit = typProduitByFacture.qteProd * Number(typProduitByFacture.unTypProduit.tarifHt);
        return montantProduit;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesTypProduits {
    constructor() {
        // rien
    }
    load(result) {
        // à partir d’un TdataSet, conversion en tableau d’objets UnTypProduit
        let typProduits = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const typProduit = new UnTypProduit(item['code_prod'], item['lib_prod'], item['type'], item['origine'], item['conditionnement'], item['tarif_ht']);
            typProduits[typProduit.codeProd] = typProduit; // clé d’un élément du tableau : id equipt
        }
        return typProduits;
    }
    prepare(where) {
        let sql;
        sql = "SELECT code_prod, lib_prod, type, origine, conditionnement, tarif_ht";
        sql += " FROM produit";
        if (where.trim() !== "") {
            sql += " WHERE " + where;
        }
        sql += " ORDER BY lib_prod ASC ";
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    byCodeProd(code_prod) {
        let typProduit = new UnTypProduit;
        const typProduits = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("code_prod = ?"), [code_prod]));
        const lesCles = Object.keys(typProduits);
        // affecte les clés du tableau associatif « typProduits » dans le tableau de chaines « lesCles »
        if (lesCles.length > 0) {
            typProduit = typProduits[lesCles[0]]; // récupérer le 1er élément du tableau associatif « typProduits »
        }
        return typProduit;
    }
    toArray(typProduits) {
        // d’un tableau de tableaux associatifs pour un affichage dans un tableau HTML
        let T = [];
        for (let id in typProduits) {
            T.push(typProduits[id].toArray());
        }
        return T;
    }
}
class UnTypProduitByFacture {
    constructor(unTypProduit = null, qteProd = 0) {
        // attributs de produit auxquelles on ajouter l’attribut « qte » de la relation « ligne »
        this._unTypProduit = unTypProduit;
        this._qteProd = qteProd;
    }
    // définition des « getters » et des « setters » pour les attributs privés de la classe
    get qteProd() { return this._qteProd; }
    set qteProd(qteProd) { this._qteProd = qteProd; }
    get unTypProduit() { return this._unTypProduit; }
    set unTypProduit(unTypProduit) { this._unTypProduit = unTypProduit; }
    toArray() {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        let tableau = this.unTypProduit.toArray(); // appel de la méthode « toArray » de « UnTypProduit »
        tableau['qteProd'] = this.qteProd.toFixed(0);
        return tableau;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class LesTypProduitsByFacture {
    constructor() {
        // rien
    }
    load(result) {
        // à partir d’un TdataSet, conversion en tableau d’objets UnTypProduitByFacture
        const typProduitsByFacture = {};
        const lesTypProduits = new LesTypProduits();
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const UnTypProduit = lesTypProduits.byCodeProd(item['code_prod']);
            const typProduitByFacture = new UnTypProduitByFacture(UnTypProduit, parseInt(item['qte_prod']));
            typProduitsByFacture[typProduitByFacture.unTypProduit.codeProd] = typProduitByFacture;
        }
        return typProduitsByFacture;
    }
    prepare(where) {
        let sql;
        sql = "SELECT code_prod, qte_prod";
        sql += " FROM ligne";
        if (where.trim() !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    byNumFact(num_fact) {
        // renvoie le tableau d’objets contenant tous les produits de la facture num_fact
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?"), [num_fact]));
    }
    byNumFactureCodeProd(num_fact, code_prod) {
        // renvoie l’objet du produit code_prod contenu dans la facture num_fact
        let typProduitByFacture = new UnTypProduitByFacture;
        let typProduitsByFacture = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ? and code_prod = ?"), [num_fact, code_prod]));
        if (!typProduitsByFacture[0] === undefined) {
            typProduitByFacture = typProduitsByFacture[0];
        }
        return typProduitByFacture;
    }
    toArray(typProduits) {
        let T = [];
        for (let id in typProduits) {
            T.push(typProduits[id].toArray());
            delete T[T.length - 1].type; // pas besoin du type pour l'affichage dans le tableau
        }
        return T;
    }
    getTotalMontantSansRemise(typProduits) {
        // renvoie le montant total d'une facture sans remise
        let totalHt = 0;
        for (let id in typProduits) {
            totalHt += typProduits[id].unTypProduit.getMontantProduit(typProduits[id]);
        }
        return totalHt;
    }
    getTotalMontantRemise(typProduits, uneFacture) {
        // renvoie le montant total de la remise sur la facture
        const totalRemise = this.getTotalMontantSansRemise(typProduits) * (Number(uneFacture.tauxRemiseFact) / 100);
        return totalRemise;
    }
    getTotalMontantAvecRemise(typProduits, uneFacture) {
        // renvoie le montant total d’une facture avec remise
        const totalAPayer = this.getTotalMontantSansRemise(typProduits) - this.getTotalMontantRemise(typProduits, uneFacture);
        return totalAPayer;
    }
    delete(num_fact) {
        let sql;
        sql = "DELETE FROM ligne WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]); // requête de manipulation : utiliser SQLexec
    }
    insert(num_fact, typProduits) {
        // requête d’ajout des produits avec une quantité dans « ligne » installé dans « num_fact »
        let sql;
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
export { connexion };
export { UnTypProduit };
export { LesTypProduits };
export { UnTypProduitByFacture };
export { LesTypProduitsByFacture };
//# sourceMappingURL=data_produit.js.map