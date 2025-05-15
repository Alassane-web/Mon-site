let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || {};
let utilisateurConnecte = null;

function afficherFormulaireConnexion() {
    document.getElementById("formulaire").innerHTML = `
        <h3>Connexion</h3>
        <input id="email" placeholder="Adresse mail"><br>
        <input id="mdp" type="password" placeholder="Mot de passe"><br>
        <button onclick="seConnecter()">Valider</button>
    `;
}

function afficherFormulaireInscription() {
    document.getElementById("formulaire").innerHTML = `
        <h3>Inscription</h3>
        <input id="email" placeholder="Adresse mail"><br>
        <input id="mdp" type="password" placeholder="Mot de passe"><br>
        <input id="mdp2" type="password" placeholder="Confirmer le mot de passe"><br>
        <button onclick="sInscrire()">S'inscrire</button>
    `;
}

function sInscrire() {
    let email = document.getElementById("email").value;
    let mdp = document.getElementById("mdp").value;
    let mdp2 = document.getElementById("mdp2").value;

    if (mdp !== mdp2) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    utilisateurs[email] = mdp;
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    alert("Inscription réussie !");
    afficherFormulaireConnexion();
}

function seConnecter() {
    let email = document.getElementById("email").value;
    let mdp = document.getElementById("mdp").value;

    if (utilisateurs[email] && utilisateurs[email] === mdp) {
        utilisateurConnecte = email;
        localStorage.setItem("utilisateurConnecte", email);
        alert("Connexion réussie !");
    } else {
        alert("Adresse-Email ou Mots de passe incorrectes.");
    }
}
function voirProduits() {
    window.location.href = "produits.html";
}
function acheter() {
    const connecté = localStorage.getItem("utilisateurConnecte");
    if (connecté) {
        alert("Achat effectué avec succès !");
    } else {
        alert("Veuillez vous connecter pour effectuer un achat.");
    }
}
let panier = JSON.parse(localStorage.getItem("panier")) || [];

function ajouterAuPanier(nom, prix) {
    panier.push({ nom, prix });
    localStorage.setItem("panier", JSON.stringify(panier));
    mettreAJourPanier();
    alert(nom + " ajouté au panier !");
}

function mettreAJourPanier() {
    const total = panier.reduce((acc, item) => acc + item.prix, 0);
    document.getElementById("total").textContent = total;
    document.getElementById("nbArticles").textContent = panier.length;
}

function voirPanier() {
    const utilisateur = localStorage.getItem("utilisateurConnecte");
    if (!utilisateur) {
        alert("Connectez-vous pour acheter.");
        return;
    }

    if (panier.length === 0) {
        alert("Votre panier est vide.");
        return;
    }

    let contenu = "Votre commande :\n";
    panier.forEach(item => {
        contenu += `- ${item.nom} : ${item.prix} FCFA\n`;
    });

    const total = panier.reduce((acc, item) => acc + item.prix, 0);
    contenu += `\nTotal à payer : ${total} FCFA`;
    contenu += `\n\nVeuillez effectuer un virement Orange Money au numéro suivant : +22374824195.`;
    contenu += `\n\nCliquez sur OK uniquement après avoir fait le virement.`;

    if (confirm(contenu)) {
        // Demande les informations de paiement
        const numeroClient = prompt("Entrez le numéro utilisé pour le virement Orange Money :");
        const idTransaction = prompt("Entrez l’ID de transaction reçu par Orange Money :");

        if (!numeroClient || !idTransaction) {
            alert("Transaction non confirmée.");
            return;
        }

        // Vérification très basique (tu peux améliorer cela plus tard)
        if (numeroClient.length < 8 || idTransaction.length < 5) {
            alert("Informations invalides. Reçu non généré.");
            return;
        }

        // Reçu + notification
        genererRecu(utilisateur, numeroClient, idTransaction);
        envoyerEmailAuProprietaire(utilisateur, panier, total, numeroClient, idTransaction);
        
        // Réinitialiser le panier
        panier = [];
        localStorage.setItem("panier", JSON.stringify([]));
        mettreAJourPanier();
    }
}
function mettreAJourPanier() {
    const panierDiv = document.getElementById("panier");
    panierDiv.innerHTML = "<h2>Votre Panier</h2>";

    if (panier.length === 0) {
        panierDiv.innerHTML += "<p>Le panier est vide.</p>";
        return;
    }

    let total = 0;
    panier.forEach((item, index) => {
        total += item.prix;
        panierDiv.innerHTML += `
            <div style="margin-bottom: 10px;">
                <strong>${item.nom}</strong> - ${item.prix} FCFA
                <button onclick="retirerDuPanier(${index})">Retirer</button>
            </div>
        `;
    });

    panierDiv.innerHTML += `<p><strong>Total :</strong> ${total} FCFA</p>`;
}
function retirerDuPanier(index) {
    panier.splice(index, 1); // Supprime le produit à l’index donné
    localStorage.setItem("panier", JSON.stringify(panier));
    mettreAJourPanier(); // Mise à jour de l'affichage
}
function genererRecu(utilisateur, numero, transactionId) {
    const total = panier.reduce((acc, item) => acc + item.prix, 0);
    const details = panier.map(item => `- ${item.nom} : ${item.prix} FCFA`).join('\n');

    alert(
        "=== REÇU DE PAIEMENT ===\n" +
        `Client : ${utilisateur}\n` +
        `Téléphone : ${numero}\n` +
        `Transaction ID : ${transactionId}\n\n` +
        `Produits achetés :\n${details}\n\n` +
        `Montant total : ${total} FCFA\n` +
        "Méthode de paiement : Orange Money\n" +
        "Merci pour votre achat !"
    );
}
function envoyerEmailAuProprietaire(client, produits, total) {
    const details = produits.map(p => `- ${p.nom} : ${p.prix} FCFA`).join('\n');

    const templateParams = {
        from_name: client,
        to_name: "Alassane Doucouré",
        message: `Un nouveau client a passé commande.\n\nProduits :\n${details}\n\nTotal : ${total} FCFA`
    };

    emailjs.send('TON_SERVICE_ID', 'TON_TEMPLATE_ID', templateParams)
    .then(function(response) {
       alert("Notification envoyée au propriétaire !");
    }, function(error) {
       alert("Erreur lors de l'envoi de l'email : " + JSON.stringify(error));
    });
}