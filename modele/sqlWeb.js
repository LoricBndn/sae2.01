class SQLWeb {
    init(cheminHTML, http) {
        this.spExec = http + 'spExec.php';
        this.cheminHTML = cheminHTML;
        this.http = http;
    }
    getXhr() {
        let xhr = null;
        if (window.XMLHttpRequest) // firefox et autres
         {
            xhr = new XMLHttpRequest;
        }
        return xhr;
    }
    SQLexec(sp, params) {
        this.SQLloadData(sp, params, 'manipulation');
        return true;
    }
    SQLloadData(sp, params, req = 'interrogation') {
        // fetch ne fonctionne pas en mode synchrone ==> mode synchrone obligatoire
        const xhr = this.getXhr();
        let resultat = [];
        if (xhr) { // on définit ce qu'on va faire quand on aura la réponse
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let src = JSON.parse(xhr.responseText);
                    resultat = src['resultat'];
                }
            };
            xhr.open("POST", this.spExec, false); // mode synchrone obligatoire
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            for (let i in params) {
                params[i] = encodeURIComponent(params[i]);
            }
            xhr.send('sp=' + encodeURIComponent(sp) + '&bd=' + JSON.stringify(this.bd) + '&params=' + JSON.stringify(params) + '&req=' + req);
        }
        return resultat;
    }
    bdOpen(host, port, bdname, user, pwd, charset = 'utf8', driver = 'mysql') {
        this.bd = { host: host, port: port, bdname: bdname, user: user, pwd: pwd, charset: charset, driver: driver };
        this.SQLloadData("", []);
    }
}
let sqlWeb = new SQLWeb();
export { sqlWeb };
//# sourceMappingURL=sqlWeb.js.map