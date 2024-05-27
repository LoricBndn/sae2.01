import { UneFacture, LesFactures } from "../modele/data_facture.js"
import { UnForfait, LesForfaits } from "../modele/data_forfait.js"
import {
    UnTypProduitByFacture, LesTypProduitsByFacture, TTypProduitsByFacture, UnTypProduit,
    LesTypProduits
} from "../modele/data_produit.js"
import { UnClient, LesClients } from "../modele/data_client.js"

type TStatutValeur = 'correct' | 'vide' | 'inconnu' | 'doublon'
type TErreur = { statut: TStatutValeur, msg: { [key in TStatutValeur]: string } }
type TFactureEditForm = {
    divDetail: HTMLElement
    , divTitre: HTMLElement
    , edtNum: HTMLInputElement
    , edtDate: HTMLInputElement
    , edtCommentaire: HTMLInputElement
    , edtCodeClient: HTMLInputElement
    , listeLiv: HTMLSelectElement
    , edtRemise: HTMLInputElement
    , btnRetour: HTMLInputElement
    , btnValider: HTMLInputElement
    , btnAnnuler: HTMLInputElement
    , lblDetailClient: HTMLLabelElement
    , lblDetailLiv: HTMLLabelElement
    , lblDetailProduit: HTMLLabelElement
    , lblDateErreur: HTMLLabelElement
    , lblCodeClientErreur: HTMLLabelElement
    , lblRemiseErreur: HTMLLabelElement
    , lblProduitErreur: HTMLLabelElement
    , divFactureProduit: HTMLDivElement
    , divFactureProduitEdit: HTMLDivElement
    , btnAjouterProduit: HTMLInputElement
    , lblHt: HTMLLabelElement
    , lblRemise: HTMLLabelElement
    , lblApayer: HTMLLabelElement
    , tableProduit: HTMLTableElement
    , listeProduit: HTMLSelectElement
    , edtQte: HTMLInputElement
    , btnValiderProduit: HTMLInputElement
    , btnAnnulerProduit: HTMLInputElement
    , lblSelectProduitErreur: HTMLLabelElement
    , lblQteErreur: HTMLLabelElement
};

class VueFactureEdit {
    private _form: TFactureEditForm
    private _params: string[]; // paramètres reçus par le fichier HTML
    // tel que params[0] : mode affi, modif, suppr, ajout
    // params[1] : id en mode affi, modif, suppr
    private _grille: TTypProduitsByFacture; // tableau des équipements de la salle
    private _erreur: {
        // tableau contenant les messages d'erreur pour chaque type d'erreur pour chaque zone de saisie à vérifier
        [key: string]: TErreur
    }
    private _detailProduitSelect: string

    get form(): TFactureEditForm { return this._form }
    get params(): string[] { return this._params }
    get grille(): TTypProduitsByFacture { return this._grille }
    get erreur(): { [key: string]: TErreur } { return this._erreur }
    get detailProduitSelect(): string { return this._detailProduitSelect }
    set detailProduitSelect(detail_produit_select: string) { this._detailProduitSelect = detail_produit_select }

    initMsgErreur(): void {
        // les erreurs "champ vide", "valeur inconnue", "doublon"
        //sont les trois principales erreurs dans un formulaire
        // pour chaque champ à contrôler (événement onChange),
        //création des 3 messages d'erreur + message pour correct
        // avec chaîne vide si pas d'erreur générée pour un type d'erreur potentielle
        this._erreur = {
            edtDate: {
                statut: "vide",
                msg: {
                  correct: "",
                  vide: "La date doit être renseignée.",
                  inconnu: "La date ne doit pas être postérieure à la date du jour.",
                  doublon: "",
                },
            }
            , edtCodeClient: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "Le numéro de client doit être renseigné."
                    , inconnu: "Numéro de client inconnu."
                    , doublon: ""
                }
            }
            , edtRemise: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "La remise doit être un nombre entier supérieur ou égal à 0"
                    , inconnu: "Le taux doit être compris entre 0 et le taux maximum accordé au client"
                    , doublon: ""
                }
            }
            , produit: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "La facture doit contenir au moins un produit."
                    , inconnu: ""
                    , doublon: ""
                }
            }
            , listeProduit: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "Aucun produit choisi"
                    , inconnu: ""
                    , doublon: ""
                }
            }
            , edtQte: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "La quantité doit être un nombre entier supérieur à 0"
                    , inconnu: ""
                    , doublon: ""
                }
            }
        }
    }

    init(form: TFactureEditForm): void {
        this._form = form;
        this._params = location.search.substring(1).split('&');
        // params[0] : mode affi, modif, suppr, ajout
        // params[1] : id en mode affi, modif, suppr
        this.form.divFactureProduitEdit.hidden = true;
        this.initMsgErreur();
        let titre: string;
        switch (this.params[0]) {
            case "suppr": titre = "Suppression d'une facture"; break;
            case "ajout": titre = "Nouvelle facture"; break;
            case "modif": titre = "Modification d'une facture"; break;
            default: titre = "Détail d'une facture";
        }
        this.form.divTitre.textContent = titre;
        this.form.listeLiv.innerHTML = "";
        const lesFactures = new LesFactures();
        const lesForfaits = new LesForfaits();
        const affi = this.params[0] === "affi";
        this._detailProduitSelect = ""
        if (this.params[0] === "ajout") { 
            let listeFactures = lesFactures.all();
            let listeLivraison = lesForfaits.all();
            let i = 0;
            let k: string;
            const numNouvelleFact = lesFactures.numDerniereFacture(listeFactures)+1;
            const dateDuJour = lesFactures.dateDuJour();
            const remiseParDefaut = 0;

            this.form.edtNum.value = numNouvelleFact.toFixed(0);
            this.form.edtDate.value = lesFactures.convertDateToEnglish(dateDuJour);
            for (let j in listeLivraison) {
                if (i === 0) {
                k = j;
                }
                const forfait = listeLivraison[j];
                const option = document.createElement("option");
                option.value = forfait.idForfait;
                option.text = forfait.libForfait;
                this.form.listeLiv.appendChild(option);
                i = 1;
            }
            this.form.listeLiv.value = listeLivraison[k].idForfait;
            this.form.edtRemise.value = remiseParDefaut.toFixed(0);
            this.form.edtNum.readOnly = true;
            this.form.edtDate.readOnly = affi;
            this.form.edtCommentaire.readOnly = affi;
            this.form.edtCodeClient.readOnly = affi;
            this.form.listeLiv.disabled = affi;
            this.form.edtRemise.readOnly = affi;
            this.detailForfait(vueFactureEdit.form.listeLiv.value);
        } else {
            // affi ou modif ou suppr
            const facture = lesFactures.byNumFact(this._params[1]);
            const forfait = lesForfaits.byIdForfait(facture.idForfait);
            let listeLivraison = lesForfaits.all();
            this.form.edtNum.value = facture.numFact;
            this.form.edtDate.value = facture.dateFact;
            this.form.edtCommentaire.value = facture.commentFact;
            this.form.edtCodeClient.value = facture.idCli;
            for (const j in listeLivraison) {
                const forfait = listeLivraison[j];
                const option = document.createElement("option");
                option.value = forfait.idForfait;
                option.text = forfait.libForfait;
                this.form.listeLiv.appendChild(option);
            }
            this.form.listeLiv.value = forfait.idForfait;
            this.form.edtRemise.value = facture.tauxRemiseFact;

            this.form.edtNum.readOnly = true;
            this.form.edtDate.readOnly = affi;
            this.form.edtCommentaire.readOnly = affi;
            this.form.edtCodeClient.readOnly = affi;
            this.form.listeLiv.disabled = affi;
            this.form.edtRemise.readOnly = affi
            this.detailClient(String(facture.idCli));
            this.detailForfait(vueFactureEdit.form.listeLiv.value);
        }
        this.affiProduit();
        if (this.params[0] === 'suppr') {
            // temporisation 1 seconde pour afficher les données de la salle avant demande de confirmation de la supression
            setTimeout(() => { this.supprimer(this.params[1]) }, 1000);
        }
        this.form.btnRetour.hidden = !affi;
        this.form.btnValider.hidden = affi;
        this.form.btnAnnuler.hidden = affi;
        this.form.btnAjouterProduit.hidden = affi;
        // définition des événements
        this.form.edtCodeClient.onchange = function (): void {
            vueFactureEdit.detailClient(String(vueFactureEdit.form.edtCodeClient.value));
        }
        this.form.listeLiv.onchange = function (): void {
            vueFactureEdit.detailForfait(String(vueFactureEdit.form.listeLiv.value));
        }
        this.form.edtRemise.onchange = function (): void {
            vueFactureEdit.calculRemise(String(vueFactureEdit.form.edtRemise.value));
        };
        this.form.listeProduit.addEventListener('mouseover', (event) => {
            const target = event.target as HTMLOptionElement;
            const codeProd = target.value;
            vueFactureEdit.detailProduitSurvol(String(codeProd));
        });
        this.form.listeProduit.addEventListener('mouseout', () => {
            vueFactureEdit.form.lblDetailProduit.textContent = this.detailProduitSelect;
        });
        this.form.listeProduit.onchange = function (): void {
            vueFactureEdit.detailProduitSelect = vueFactureEdit.detailProduitClick(String(vueFactureEdit.form.listeProduit.value));
        }
        this.form.btnRetour.onclick = function (): void { vueFactureEdit.retourClick(); }
        this.form.btnAnnuler.onclick = function (): void { vueFactureEdit.retourClick(); }
        this.form.btnValider.onclick = function (): void { vueFactureEdit.validerClick(); }
        this.form.btnAjouterProduit.onclick = function (): void { vueFactureEdit.ajouterProduitClick(); }
        this.form.btnValiderProduit.onclick = function (): void { vueFactureEdit.validerProduitClick(); }
        this.form.btnAnnulerProduit.onclick = function (): void { vueFactureEdit.annulerProduitClick(); }
    }

    detailClient(valeur: string): void {
        const err = this.erreur.edtCodeClient
        const lesClients = new LesClients;
        const detail = this.form.lblDetailClient;
        detail.textContent = "";
        err.statut = "correct";
        const chaine: string = valeur.trim();
        if (chaine.length > 0) {
            const client: UnClient = lesClients.byIdCli(chaine);
            if (client.idCli !== "") { // client trouvé
                detail.textContent
                    = client.civCli + " " + client.nomCli + " " + client.prenomCli + "\r\n" 
                    + client.adrCli + " - " + client.cpCli + " " +client.communeCli + "\r\n" 
                    + client.melCli + "\r\n" 
                    + "Taux de remise maximum accordé : " + client.tauxmaxRemiseCli + "%";
            }
            else {
                err.statut = 'inconnu';
                detail.textContent = err.msg.inconnu;
            }
        }
        else err.statut = 'vide';
    }

    detailForfait(valeur: string): void {
        const lesForfaits = new LesForfaits;
        const detail = this.form.lblDetailLiv;
        detail.textContent = "";
        const chaine: string = valeur.trim();
        if (chaine.length > 0) {
            const forfait: UnForfait = lesForfaits.byIdForfait(chaine);
            if (forfait.idForfait !== "") { // forfait trouvé
                detail.textContent
                    = forfait.libForfait + "\r\n" + forfait.mtForfait + " €";
            }
        }
    }

    calculRemise(valeur: string): void {
        const detailRemise = this.form.lblRemise;
        const detailAPayer = this.form.lblApayer;
        const detailHT = this.form.lblHt;
        detailAPayer.textContent = "";
        detailRemise.textContent = "";
        let prix = 0;
        let remise = 0;
        for (let id in this.grille) {
            const unTypProduitByFacture: UnTypProduitByFacture = this.grille[id];
            prix = unTypProduitByFacture.qteProd*Number(unTypProduitByFacture.unTypProduit.tarifHt);
            remise += Number(valeur) / 100 * prix;
        }
        detailRemise.textContent = remise.toFixed(2);
        detailAPayer.textContent = (Number(detailHT.textContent) - remise).toFixed(2);      
    }

    detailProduitSurvol(codeProd: string): void {
        const lesTypProduits = new LesTypProduits;
        const detail = this.form.lblDetailProduit;
        const produit: UnTypProduit = lesTypProduits.byCodeProd(codeProd);
        if (produit.codeProd !== "") { // produit trouvé
            detail.textContent
                = produit.type + "\r\n" + produit.conditionnement + "cl" + "\r\n" 
                + produit.origine + "\r\n" + produit.tarifHt + " €";
        }
    }

    detailProduitClick(codeProd: string): string {
        const lesTypProduits = new LesTypProduits;
        const detail = this.form.lblDetailProduit;
        const produit: UnTypProduit = lesTypProduits.byCodeProd(codeProd);
        if (produit.codeProd !== "") { // produit trouvé
            detail.textContent
                = produit.type + "\r\n" + produit.conditionnement + "cl" + "\r\n" 
                + produit.origine + "\r\n" + produit.tarifHt + " €";
            return produit.type + "\r\n" + produit.conditionnement + "cl" + "\r\n" 
                + produit.origine + "\r\n" + produit.tarifHt + " €";
            }
        else {
            return ""
        }
    }

    affiProduit(): void {
        const lesTypProduitsByFacture = new LesTypProduitsByFacture();
        this._grille = lesTypProduitsByFacture.byNumFact(this.params[1]);
        this.affiGrilleProduit();
    }

    affiGrilleProduit(): void {
        while (this.form.tableProduit.rows.length > 1) { this.form.tableProduit.rows[1].remove(); }
        let ht = 0;
        for (let id in this._grille) {
            const unTypProduitByFacture: UnTypProduitByFacture = this.grille[id];
            const tr = this.form.tableProduit.insertRow();
            tr.insertCell().textContent = unTypProduitByFacture.unTypProduit.codeProd;
            tr.insertCell().textContent = unTypProduitByFacture.unTypProduit.libProd;
            tr.insertCell().textContent = unTypProduitByFacture.unTypProduit.type
            tr.insertCell().textContent = unTypProduitByFacture.unTypProduit.conditionnement;
            tr.insertCell().textContent = unTypProduitByFacture.unTypProduit.tarifHt;
            tr.insertCell().textContent = unTypProduitByFacture.qteProd.toFixed(0);
            tr.insertCell().textContent = String(Number(unTypProduitByFacture.unTypProduit.tarifHt) * unTypProduitByFacture.qteProd);
            const affi = this.params[0] === 'affi';
            if (!affi) {
                let balisea: HTMLAnchorElement; // déclaration balise <a>
                // création balise <a> pour appel modification produit dans facture
                balisea = document.createElement("a")
                balisea.classList.add('img_modification')
                balisea.onclick = function (): void { vueFactureEdit.modifierProduitClick(id); }
                tr.insertCell().appendChild(balisea)
                // création balise <a> pour appel suppression produit dans facture
                balisea = document.createElement("a")
                balisea.classList.add('img_corbeille')
                balisea.onclick = function (): void { vueFactureEdit.supprimerProduitClick(id); }
                tr.insertCell().appendChild(balisea)
            }
            ht += Number(unTypProduitByFacture.unTypProduit.tarifHt) * unTypProduitByFacture.qteProd;
        }
        this.form.lblHt.textContent = ht.toFixed(2);
        this.calculRemise(String(vueFactureEdit.form.edtRemise.value));
    }

    supprimer(numFact: string): void {
        if (confirm("Confirmez-vous la suppression de la facture " + numFact)) {
            let lesTypProduitsByFacture: LesTypProduitsByFacture = new LesTypProduitsByFacture();
            lesTypProduitsByFacture.delete(numFact); // suppression dans la base des produits de la facture
            const lesFactures = new LesFactures;
            lesFactures.delete(numFact); // suppression dans la base de la facture
        }
        this.retourClick();
    }

    verifDate(date: string): void {
        const lesFactures = new LesFactures;
        const uneFacture = new UneFacture();
        const err = this._erreur.edtDate;
        const labelError = this.form.lblDateErreur;
        const chaine: string = date.trim();
        err.statut = "correct";
        if (chaine.length === 0) {
          err.statut = "vide";
          labelError.textContent = err.msg.vide;
        } else if (!uneFacture.estDateValide(chaine)) {
          err.statut = "inconnu";
          labelError.textContent = err.msg.inconnu;
        } else {
          const dateRécup = new Date(lesFactures.convertDateToEnglish(chaine));
          const dateDuJour = new Date(lesFactures.convertDateToEnglish(lesFactures.dateDuJour()));
          if (dateRécup > dateDuJour) {
            err.statut = "inconnu";
            labelError.textContent = err.msg.inconnu;
          }
        }
    }

    verifCodeClient(valeur: string): void {
        const lesFactures = new LesFactures();
        const err = this.erreur.edtCodeClient
        err.statut = "correct";
        const chaine: string = valeur.trim();
        if (chaine.length > 0) {
            if (!chaine.match(/^([0-9]+)$/)) {
                // expression régulière qui teste si la chaîne ne contient rien d'autre
                // que des chiffres
                this.erreur.edtCodeClient.statut = 'inconnu';
            }
            else if ((this.params[0] === "ajout") && (lesFactures.idExiste(chaine))) {
                this.erreur.edtCodeClient.statut = 'doublon';
            }
        }
        else err.statut = 'vide';
    }

    verifRemise(valeur: string, client: string): void {
        const err = this._erreur.edtRemise;
        const labelError = this.form.lblRemiseErreur;
        const lesClients = new LesClients();
        labelError.textContent = "";
        err.statut = "correct";
        const chaineClient = client.trim();
        const chaine: string = valeur.trim();
        if (chaineClient.length > 0) {
            const leClient: UnClient = lesClients.byIdCli(chaineClient);
            if (chaine.length > 0) {
                if (leClient.idCli !== "") {
                    // Client trouvé
                    if (Number(valeur) >= 0 && Number(valeur) <= 100 && Number(valeur) <= Number(leClient.tauxmaxRemiseCli)) {
                    } else {
                    err.statut = "inconnu";
                    labelError.textContent = err.msg.inconnu;
                    }
                }
            } else {
                err.statut = "vide";
                labelError.textContent = err.msg.vide;
            }
        }
    }

    traiteErreur(uneErreur: TErreur, zone: HTMLElement): boolean {
        let correct = true;
        zone.textContent = "";
        if (uneErreur.statut !== "correct") { // non correct ==> erreur
            if (uneErreur.msg[uneErreur.statut] !== '') { // erreur
                zone.textContent = uneErreur.msg[uneErreur.statut];
                correct = false;
            }
        }
        return correct;
    }

    validerClick(): void {
        let correct = true;
        const facture = new UneFacture;
        const lesFactures = new LesFactures;
        this.verifDate(lesFactures.convertDateToFrench(this._form.edtDate.value));
        this.verifCodeClient(this._form.edtCodeClient.value);
        this.verifRemise(this._form.edtRemise.value, this._form.edtCodeClient.value);
        if (JSON.stringify(this.grille) === '{}') { this._erreur.produit.statut = 'vide' }
        else this._erreur.produit.statut = "correct";
        correct = this.traiteErreur(this._erreur.edtDate, this.form.lblDateErreur) && correct;
        correct = this.traiteErreur(this._erreur.edtCodeClient, this.form.lblCodeClientErreur) && correct;
        correct = this.traiteErreur(this._erreur.edtRemise, this.form.lblRemiseErreur) && correct;
        correct = this.traiteErreur(this._erreur.produit, this.form.lblProduitErreur) && correct;
        if (correct) {  
            facture.numFact = this.form.edtNum.value;
            facture.dateFact = lesFactures.convertDateToFrench(this.form.edtDate.value)
            facture.commentFact = this.form.edtCommentaire.value;
            facture.idCli = this.form.edtCodeClient.value;
            facture.idForfait = this.form.listeLiv.value; 
            facture.tauxRemiseFact = this.form.edtRemise.value;
            if (this._params[0] === "ajout") {
                lesFactures.insert(facture);
            }
            else {
                lesFactures.update(facture);
            }
            const lesTypProduitsByFacture: LesTypProduitsByFacture = new LesTypProduitsByFacture;
            lesTypProduitsByFacture.delete(facture.numFact);
            lesTypProduitsByFacture.insert(facture.numFact, this.grille);
            this.retourClick();
        }
    }

    retourClick(): void {
        location.href = "facture_liste.html";
    }

    // gestion des produits de la facture
    modifierProduitClick(id: string): void {
        this.afficherProduitEdit();
        this.detailProduitClick(id);
        const lesTypProduits = new LesTypProduits();
        const UnTypProduit: UnTypProduit = lesTypProduits.byCodeProd(id);
        this.form.listeProduit.length = 0;
        this.form.listeProduit.options.add(new Option(UnTypProduit.libProd, id)); // text, value = 0;
        this.form.listeProduit.selectedIndex = 0;
        this.form.edtQte.value = this._grille[id].qteProd.toFixed(0);
    }

    ajouterProduitClick(): void {
        this.afficherProduitEdit();
        // réinitialiser la liste des produits à choisir
        this.form.listeProduit.length = 0;
        const lesTypProduits = new LesTypProduits;
        const data = lesTypProduits.all();
        const idProduits = [];
        for (let i in this._grille) {
            idProduits.push(this._grille[i].unTypProduit.codeProd);
        }
        for (let i in data) {
            const id = data[i].codeProd;
            if (idProduits.indexOf(id) === -1) { // pas dans la liste des produits déjà dans la facture
                this._form.listeProduit.options.add(new Option(data[i].libProd, id)); // text, value

            }
        }
    }

    supprimerProduitClick(id: string): void {
        if (confirm("Confirmez-vous le retrait du produit de la facture ")) {
            delete (this._grille[id]);
            this.affiGrilleProduit();
        }
    }

    afficherProduitEdit(): void {
        this.form.divFactureProduitEdit.hidden = false;
        this.form.divDetail.style.pointerEvents = 'none';
        this.form.divFactureProduitEdit.style.pointerEvents = 'auto';
        this.form.btnAjouterProduit.hidden = true;
        this.form.btnAnnuler.hidden = true;
        this.form.btnValider.hidden = true;
    }

    cacherProduitEdit(): void {
        this.form.divFactureProduitEdit.hidden = true;
        this.form.divDetail.style.pointerEvents = 'auto';
        this.form.btnAjouterProduit.hidden = false;
        this.form.btnAnnuler.hidden = false;
        this.form.btnValider.hidden = false;
    }

    verifListeProduit(): void {
        const err = this._erreur.listeProduit
        err.statut = "correct";
        const cible = this._form.listeProduit;
        if (cible.value === "") {
            err.statut = 'vide'
        }
    }

    verifQte(): void {
        const err = this._erreur.edtQte
        err.statut = "correct";
        const valeur: string = this._form.edtQte.value;
        if (!((Number.isInteger(Number(valeur))) && (Number(valeur) > 0))) {
            err.statut = 'vide'
        }
    }

    validerProduitClick(): void {
        let correct = true;
        this.verifListeProduit();
        this.verifQte();
        correct = this.traiteErreur(this._erreur.listeProduit, this.form.lblSelectProduitErreur) && correct;
        correct = this.traiteErreur(this._erreur.edtQte, this.form.lblQteErreur) && correct;
        if (correct) {
            const lesTypProduits = new LesTypProduits;
            // ajout visuel de la ligne dans la grille tabulaire de la liste des produits d'une facture
            const unTypProduit: UnTypProduit = lesTypProduits.byCodeProd(this._form.listeProduit.value);
            const unTypProduitByFacture: UnTypProduitByFacture
                = new UnTypProduitByFacture(unTypProduit, parseInt(this._form.edtQte.value));
            this._grille[unTypProduit.codeProd] = unTypProduitByFacture;
            this.affiGrilleProduit();
            this.annulerProduitClick();
        }
    }

    annulerProduitClick(): void {
        this.cacherProduitEdit();
    }
}

let vueFactureEdit = new VueFactureEdit;
export { vueFactureEdit }