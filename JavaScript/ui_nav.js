/* ==========================================================================
   FICHIER 5 : SÉCURITÉ, NAVIGATION ET INTERFACE
   ========================================================================== */
let estAuthentifie = sessionStorage.getItem("auth") === "true";

function naviguer(nomDeLaVue) {
  if (!estAuthentifie && nomDeLaVue !== 'securite') {
    nomDeLaVue = 'securite';
  }

  // Appels sécurisés vers les fonctions de audio_timer.js
  if (typeof stopperSequence === "function") stopperSequence();
  if (typeof pauseSon === "function") pauseSon(); 

  document.getElementById('app-content').innerHTML = vues[nomDeLaVue];
  document.getElementById("menu").classList.remove("open");
  
  const audioPanel = document.getElementById("audio-controls-container");
  if (audioPanel) {
    audioPanel.style.display = (nomDeLaVue === 'timer') ? 'block' : 'none';
  }

  if (nomDeLaVue === 'historique') {
    if (typeof afficherHistorique === "function") afficherHistorique();
  } else if (nomDeLaVue === 'statistiques') {
    if (typeof afficherGraphique === "function") afficherGraphique();
  }
}

function verifierMdp() {
  const motDePasse = document.getElementById("mdp").value;
  const hashAttendu = "3fe0dfff438296bb525e0e8642586c2d"; 
  const hashSaisi = CryptoJS.MD5(motDePasse).toString();

  if (hashSaisi === hashAttendu) {
    estAuthentifie = true;
    sessionStorage.setItem("auth", "true");
    document.getElementById("menu-toggle").style.display = "block"; 
    naviguer('accueil'); 
  } else {
    document.getElementById("erreur-mdp").style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      document.getElementById("menu").classList.toggle("open");
    });
  }
});

function toggleMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  document.getElementById("bouton-mode").textContent = isDark ? "🌙 Mode nuit" : "🌞 Mode jour";
}

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    const btnMode = document.getElementById("bouton-mode");
    if(btnMode) btnMode.textContent = "🌙 Mode nuit";
  }
  
  if (estAuthentifie) {
    document.getElementById("menu-toggle").style.display = "block";
    naviguer('accueil');
  } else {
    naviguer('securite');
  }
});