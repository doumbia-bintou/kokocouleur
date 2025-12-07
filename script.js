// Liste des couleurs avec leurs codes hexadécimaux pour le design
// et des noms clairs et faciles à prononcer.
const couleurs = [
    { nom: "ROUGE", hex: "#E74C3C" },    // Rouge
    { nom: "BLEU", hex: "#3498DB" },     // Bleu ciel
    { nom: "VERT", hex: "#2ECC71" },     // Vert pomme
    { nom: "JAUNE", hex: "#F1C40F" },    // Jaune vif
    { nom: "ORANGE", hex: "#E67E22" },   // Orange
    { nom: "VIOLET", hex: "#9B59B6" },   // Violet
    { nom: "ROSE", hex: "#FFC0CB" },     // Rose clair
    { nom: "MARRON", hex: "#8B4513" }    // Marron terre
];

let couleurActuelleIndex = -1; // -1 pour l'état initial

const zoneAffichage = document.getElementById('zone-affichage');
const nomCouleur = document.getElementById('nom-couleur');

/**
 * Lit le nom de la couleur à haute voix en français.
 * @param {string} texte - Le mot à prononcer (ex: "ROUGE").
 */
function prononcer(texte) {
    if ('speechSynthesis' in window) {
        // Crée une nouvelle instance de synthèse vocale
        const utterance = new SpeechSynthesisUtterance(texte);
        
        // Tente de trouver une voix française
        const voixFr = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('fr'));
        if (voixFr) {
            utterance.voice = voixFr;
        }
        
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9; // Vitesse légèrement ralentie pour les enfants
        window.speechSynthesis.speak(utterance);
    } else {
        console.log("La synthèse vocale n'est pas supportée par ce navigateur.");
    }
}

/**
 * Choisit une nouvelle couleur aléatoire et met à jour l'interface.
 */
function changerCouleur() {
    let nouvelIndex;
    
    // Assure que la nouvelle couleur n'est pas la même que la précédente (sauf si c'est la première fois)
    do {
        nouvelIndex = Math.floor(Math.random() * couleurs.length);
    } while (nouvelIndex === couleurActuelleIndex);
    
    couleurActuelleIndex = nouvelIndex;
    const couleur = couleurs[couleurActuelleIndex];

    // 1. Mettre à jour l'affichage de la couleur
    zoneAffichage.style.backgroundColor = couleur.hex;
    
    // 2. Mettre à jour le nom de la couleur
    nomCouleur.textContent = couleur.nom;
    nomCouleur.style.color = couleur.hex; // Le texte prend la couleur affichée pour l'emphase
    
    // 3. Prononcer le nom de la couleur
    prononcer(couleur.nom);
}

// Initialisation de l'application au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Demande au navigateur de charger les voix pour TTS (nécessaire pour certains)
    window.speechSynthesis.getVoices(); 
    
    // Appel initial pour afficher la première couleur au démarrage
    // Note: Pour des raisons d'autorisation, la prononciation est déclenchée
    // uniquement sur une action de l'utilisateur (le clic/toucher).
    // Nous laissons donc le message initial "Clique ici pour commencer !"
    // et le premier appel à `changerCouleur` se fera sur le premier clic.
});