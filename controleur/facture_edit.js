import { vueFactureEdit } from "./class_facture_edit";
vueFactureEdit.init({
    divDetail: document.querySelector('[id=div_facture_detail]'),
    divTitre: document.querySelector('[id=div_facture_titre]'),
    edtNum: document.querySelector('[id=edt_facture_num]'),
    edtDate: document.querySelector('[id=edt_facture_date]'),
    edtCommentaire: document.querySelector('[id=edt_facture_commentaire]'),
    edtCodeClient: document.querySelector('[id=edt_facture_codeclient]'),
    listeLiv: document.querySelector('[id=select_livraison]'),
    edtRemise: document.querySelector('[id=edt_facture_remise]'),
    btnRetour: document.querySelector('[id=btn_facture_retour]'),
    btnValider: document.querySelector('[id=btn_facture_valider]'),
    btnAnnuler: document.querySelector('[id=btn_facture_annuler]'),
    lblDetailClient: document.querySelector('[id=lbl_facture_detail_client]'),
    lblDetailLiv: document.querySelector('[id=lbl_facture_detail_liv]'),
    lblDetailProduit: document.querySelector('[id=lbl_facture_detail_produit]'),
    lblDateErreur: document.querySelector('[id=lbl_erreur_date]'),
    lblCodeClientErreur: document.querySelector('[id=lbl_erreur_client]'),
    lblRemiseErreur: document.querySelector('[id=lbl_erreur_remise]'),
    lblProduitErreur: document.querySelector('[id=lbl_erreur_produit]'),
    divFactureProduit: document.querySelector('[id=div_facture_produit]'),
    divFactureProduitEdit: document.querySelector('[id=div_facture_produit_edit]'),
    btnAjouterProduit: document.querySelector('[id=btn_produit_ajouter]'),
    lblHt: document.querySelector('[id=lbl_produit_ht]'),
    lblRemise: document.querySelector('[id=lbl_produit_remise]'),
    lblApayer: document.querySelector('[id=lbl_produit_apayer]'),
    tableProduit: document.querySelector('[id=table_produit]'),
    listeProduit: document.querySelector('[id=select_produit]'),
    edtQte: document.querySelector('[id=edt_produit_qte]'),
    btnValiderProduit: document.querySelector('[id=btn_produit_valider]'),
    btnAnnulerProduit: document.querySelector('[id=btn_produit_annuler]'),
    lblSelectProduitErreur: document.querySelector('[id=lbl_erreur_select_produit]'),
    lblQteErreur: document.querySelector('[id=lbl_erreur_qte]')
});
//# sourceMappingURL=facture_edit.js.map