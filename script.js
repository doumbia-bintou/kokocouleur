// --- 1. Base de Données des Couleurs (Niveaux) ---
const couleursData = {
    // Niveau 1: Débutant (2-4 ans) - Couleurs primaires et faciles
    debutant: [
        { fr: "ROUGE", en: "RED", hex: "#E74C3C" },
        { fr: "BLEU", en: "BLUE", hex: "#3498DB" },
        { fr: "VERT", en: "GREEN", hex: "#2ECC71" },
        { fr: "JAUNE", en: "YELLOW", hex: "#F1C40F" },
    ],
    // Niveau 2: Intermédiaire (5-6 ans) - Couleurs secondaires et de base
    intermediaire: [
        { fr: "ORANGE", en: "ORANGE", hex: "#E67E22" },
        { fr: "VIOLET", en: "PURPLE", hex: "#9B59B6" },
        { fr: "ROSE", en: "PINK", hex: "#FFC0CB" },
        { fr: "MARRON", en: "BROWN", hex: "#8B4513" },
        // Ajout des couleurs du niveau débutant
        ...this.debutant
    ],
    // Niveau 3: Avancé (7+ ans) - Nuances et plus de choix
    avance: [
        { fr: "GRIS", en: "GRAY", hex: "#7F8C8D" },
        { fr: "NOIR", en: "BLACK", hex: "#000000" },
        { fr: "BLANC", en: "WHITE", hex: "#ECF0F1" },
        { fr: "CYAN", en: "CYAN", hex: "#00FFFF" },
        // Ajout des couleurs des niveaux précédents
        ...this.intermediaire
    ]
};

// --- 2. Variables d'État du Jeu ---
let score = 0;
let totalTentatives = 0;
let couleurCible = null;

// --- 3. Références DOM ---
const selectNiveau = document.getElementById('select-niveau');
const selectLangue = document.getElementById('select-langue');
const consigneTexte = document.getElementById('consigne-texte');
const choixCouleursDiv = document.getElementById('choix-couleurs');
const scoreSpan = document.getElementById('score');
const feedbackMessage = document.getElementById('feedback-message');
const sonSucces = document.getElementById('son-succes');
const sonEchec = document.getElementById('son-echec');


// --- 4. Fonctions Utilitaires ---

/** Lit le texte à haute voix (TTS). */
function prononcer(texte, langue) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Arrête la parole précédente
        const utterance = new SpeechSynthesisUtterance(texte);
        utterance.lang = (langue === 'en') ? 'en-US' : 'fr-FR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

/** Joue l'effet sonore (placeholder: son-succes.mp3 ou son-echec.mp3). */
function jouerSon(type) {
    const audio = (type === 'succes') ? sonSucces : sonEchec;
    // Vérifie et recharge si besoin, puis joue (pour les mobiles)
    audio.currentTime = 0;
    audio.play().catch(e => console.error("Erreur de lecture audio:", e));
}

/** Mélange un tableau de manière aléatoire (Algorithme de Fisher-Yates). */
function melangerTableau(tableau) {
    for (let i = tableau.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
    }
    return tableau;
}

// --- 5. Logique Principale du Jeu ---

/** Initialise ou réinitialise le jeu en fonction des sélections. */
function initialiserJeu() {
    score = 0;
    totalTentatives = 0;
    mettreAJourScore();
    demarrerNouveauTour();
}

/** Met à jour l'affichage du score. */
function mettreAJourScore() {
    scoreSpan.textContent = `Score: ${score} / ${totalTentatives}`;
}

/** Génère un nouveau tour de jeu (choix de la couleur). */
function demarrerNouveauTour() {
    const niveau = selectNiveau.value;
    const langue = selectLangue.value;
    const listeCouleurs = couleursData[niveau];
    
    // 1. Définir le nombre d'options à afficher (max 4 pour débutant, 6 pour inter, 8 pour avancé)
    const maxOptions = (niveau === 'debutant') ? 4 : (niveau === 'intermediaire' ? 6 : 8);
    
    // 2. Sélectionner la couleur cible
    couleurCible = listeCouleurs[Math.floor(Math.random() * listeCouleurs.length)];

    // 3. Sélectionner des options incorrectes uniques (Distracteurs)
    let options = [couleurCible];
    let couleursDisponibles = listeCouleurs.filter(c => c !== couleurCible);
    couleursDisponibles = melangerTableau(couleursDisponibles);

    for (let i = 0; options.length < maxOptions && i < couleursDisponibles.length; i++) {
        options.push(couleursDisponibles[i]);
    }

    // 4. Mélanger toutes les options pour un ordre aléatoire
    options = melangerTableau(options);

    // 5. Afficher la consigne
    const motCible = (langue === 'en') ? couleurCible.en : couleurCible.fr;
    const consigneFr = `Trouve ${motCible} !`;
    const consigneEn = `Find ${motCible} !`;
    
    consigneTexte.textContent = (langue === 'en') ? consigneEn : consigneFr;
    consigneTexte.style.color = couleurCible.hex;
    
    // 6. Prononcer la consigne pour l'accessibilité
    prononcer(motCible, langue);
    
    // 7. Générer les boutons de choix
    genererOptions(options);
    
    // 8. Effacer le message de feedback
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
}

/** Génère les boutons de choix de couleur dans le DOM. */
function genererOptions(options) {
    choixCouleursDiv.innerHTML = '';
    options.forEach(couleur => {
        const bouton = document.createElement('div');
        bouton.className = 'option-couleur';
        bouton.style.backgroundColor = couleur.hex;
        bouton.dataset.hex = couleur.hex;
        bouton.onclick = () => verifierReponse(couleur.hex);
        choixCouleursDiv.appendChild(bouton);
    });
}

/** Vérifie la réponse du joueur. */
function verifierReponse(hexChoisi) {
    if (!couleurCible) return; // Empêche le clic si le jeu n'est pas initialisé

    totalTentatives++;
    
    if (hexChoisi === couleurCible.hex) {
        // Succès
        score++;
        feedbackMessage.textContent = (selectLangue.value === 'en') ? 'Correct! Well done!' : 'Bravo ! C\'est réussi !';
        feedbackMessage.className = 'feedback-succes';
        jouerSon('succes');
    } else {
        // Échec
        feedbackMessage.textContent = (selectLangue.value === 'en') ? 'Try again!' : 'Essaie encore !';
        feedbackMessage.className = 'feedback-echec';
        jouerSon('echec');
    }

    mettreAJourScore();
    
    // Après un petit délai, passer au tour suivant
    setTimeout(() => {
        demarrerNouveauTour();
    }, 1500); // Laisse le temps à l'enfant de voir le feedback
}


// --- 6. Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    // Pré-charge les voix TTS
    window.speechSynthesis.getVoices(); 
    
    // Démarre le jeu avec les options par défaut
    initialiserJeu();
});

// Assurez-vous que les sons sont disponibles (à créer : succes.mp3 et echec.mp3)
// Pour les tests locaux, si les sons ne sont pas là, le `catch` empêchera l'erreur.