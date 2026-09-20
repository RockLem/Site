/* ==========================================================================
   FICHIER 1 : CONFIGURATION (Vues HTML et Règles des disciplines)
   ========================================================================== */
const vues = {
  securite: `
    <div class="card" style="margin-top: 50px;">
      <h1>🔐 Accès sécurisé</h1>
      <p>Entrez le mot de passe pour accéder au site :</p>
      <input type="password" id="mdp" placeholder="🔑 Mot de passe" style="padding: 10px; font-size: 16px; margin-bottom: 10px; width: 80%; max-width: 300px;" onkeydown="if(event.key === 'Enter') verifierMdp()">
      <br>
      <button onclick="verifierMdp()">🔒 Accéder</button>
      <p id="erreur-mdp" style="color: #dc3545; display: none; margin-top: 10px; font-weight: bold;">Mot de passe incorrect</p>
    </div>
  `,
  
  accueil: `
    <h1>🏠 Bienvenue sur le Timer Tir Sportif</h1>
    <p>Ce site vous permet de vous entraîner au tir sportif avec des séquences audio adaptées à chaque discipline.</p>
    <div class="card" style="text-align: left;">
      <h2>📋 Instructions rapides</h2>
      <ol style="line-height: 1.6;">
        <li><strong>Timer & Audio :</strong> Utilisez cet onglet pour l'entraînement libre. Il contient un lecteur classique pour lancer des séquences fixes (3/7, 10sec, etc.).</li>
        <li style="margin-top: 10px;"><strong>Saisir un score (Le Séquenceur de Match) :</strong> 
            <ul style="margin-top: 5px;">
                <li>Choisissez votre discipline pour afficher la grille de score.</li>
                <li>Utilisez le panneau <strong>Configuration du Match</strong> pour ajuster les temps (Chargement, Tir, etc.).</li>
                <li><strong>🔊 Démarrer :</strong> Lance la voix de l'arbitre. L'application ajustera toute seule les temps selon les séries.</li>
                <li><strong>⏸️ Pause :</strong> Fige le chronomètre et l'audio en cours (utile en cas d'incident de tir).</li>
                <li><strong>⏭️ Passer :</strong> Permet d'ignorer un temps d'attente (ex: passer directement à la fin des 3 min de prépa).</li>
                <li><strong>⏹️ Stopper :</strong> Annule définitivement le match en cours.</li>
            </ul>
        </li>
        <li style="margin-top: 10px;"><strong>Historique & Statistiques :</strong> Suivez votre progression avec des graphiques, téléchargez vos feuilles de match en PDF, ou exportez le tout en fichier Excel.</li>
      </ol>
    </div>
  `,
  
  timer: `
    <div class="card">
      <h1>Entraînement Libre</h1>
      <div class="ligne-boutons">
        <button onclick="jouerSon('4sec.mp3')">4 sec</button>
        <button onclick="jouerSon('6sec.mp3')">6 sec</button>
        <button onclick="jouerSon('8sec.mp3')">8 sec</button>
      </div>
      <div class="ligne-boutons">
        <button onclick="jouerSon('10secEntrainement.mp3')">10 sec</button>
        <button onclick="jouerSon('20sec.mp3')">20 sec</button>
        <button onclick="jouerSon('150sec.mp3')">150 sec</button>
      </div>
      <div class="ligne-boutons">
        <button onclick="jouerSon('37.mp3')">3/7</button>
      </div>
    </div>
  `,
  
  scores: `
    <h1>🏅 Choix de la discipline</h1>
    <select id="choixDiscipline" onchange="genererGrille(this.value)" style="margin-bottom: 20px; font-size: 16px; padding: 10px; width: 100%; max-width: 400px; background-color: #2a2a2a; color: white; border: 1px solid #444; border-radius: 5px;">
      <option value="" style="background-color: #2a2a2a;">-- Sélectionnez une discipline --</option>
      
      <optgroup label="🎯 PISTOLET" style="background-color: #ffc107; color: black; font-weight: bold; font-style: normal;">
          <option value="pistolet10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 10m</option>
          <option value="standard10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Standard 10m</option>
          <option value="vitesse10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Vitesse 10m</option>
          <option value="pistolet25m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 25m</option>
          <option value="percussionCentrale" style="background-color: #2a2a2a; color: white; font-weight: normal;">Percussion Centrale</option>
          <option value="standard25m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Standard 25m</option>
          <option value="vitesseOlympique" style="background-color: #2a2a2a; color: white; font-weight: normal;">Vitesse Olympique</option>
          <option value="50mlibre" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 50m Libre</option>
      </optgroup>

      <optgroup label="🎯 CARABINE" style="background-color: #ffc107; color: black; font-weight: bold; font-style: normal;">
          <option value="carabine10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 10m</option>
          <option value="carabine60couche" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 60 balles couché - 50m</option>
          <option value="carabine3x20" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 3x20 - 50m</option>
      </optgroup>
    </select>
    
    <h2 id="titre-discipline" style="color: var(--color-primary);"></h2>
    <div id="bouton-audio-container" style="margin-bottom: 15px;"></div>
    <div id="grille-container"></div>
    
    <div id="zone-sauvegarde" style="display:none; margin-top:20px;">
        <button onclick="enregistrerScoreDynamique()">📥 Enregistrer dans l'historique</button>
    </div>
  `,

  historique: `
    <h1>📊 Historique des Scores</h1>
    
    <div style="margin-bottom: 20px;">
      <select id="filtreHistorique" onchange="afficherHistorique()" style="padding: 10px; font-size: 16px; width: 100%; max-width: 400px; background-color: #2a2a2a; color: white; border: 1px solid #444; border-radius: 5px;">
        <option value="tout" style="background-color: #2a2a2a;">Toutes les disciplines</option>
        <optgroup label="🎯 PISTOLET" style="background-color: #ffc107; color: black; font-weight: bold;">
            <option value="Pistolet 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 10m</option>
            <option value="Pistolet Standard 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Standard 10m</option>
            <option value="Pistolet Vitesse 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Vitesse 10m</option>
            <option value="Pistolet 25m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 25m</option>
            <option value="Percussion Centrale" style="background-color: #2a2a2a; color: white; font-weight: normal;">Percussion Centrale</option>
            <option value="Pistolet Standard 25m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Standard 25m</option>
            <option value="Vitesse Olympique" style="background-color: #2a2a2a; color: white; font-weight: normal;">Vitesse Olympique</option>
            <option value="Pistolet 50m Libre" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 50m Libre</option>
        </optgroup>
        <optgroup label="🎯 CARABINE" style="background-color: #ffc107; color: black; font-weight: bold;">
            <option value="Carabine 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 10m</option>
            <option value="Carabine 60 balles couché - 50m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 60 balles couché - 50m</option>
            <option value="Carabine 3x20 - 50m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 3x20 - 50m</option>
        </optgroup>
      </select>
    </div>

    <div class="ligne-boutons" style="margin-bottom: 20px; flex-wrap: wrap;">
      <button onclick="supprimerSelection()" style="background-color: #dc3545;">🗑️ Supprimer la sélection</button>
      <button onclick="viderHistorique()" style="background-color: #dc3545;">🧹 Tout Vider</button>
      <button onclick="exporterCSV()" style="background-color: #28a745;">📥 Exporter en CSV</button>
      <button onclick="genererPDF()" style="background-color: #007bff;">📄 Exporter PDF (Sélection)</button>
    </div>
    
    <div class="card" id="historique-container" style="overflow-x: auto; padding: 0;">
      <p style="padding: 20px;">Chargement de l'historique...</p>
    </div>
  `,

  statistiques: `
    <h1>📈 Progression & Statistiques</h1>
    <p>Sélectionnez une discipline pour afficher la courbe de vos scores totaux.</p>
    
    <div style="margin-bottom: 20px;">
      <select id="filtreStats" onchange="afficherGraphique()" style="padding: 10px; font-size: 16px; width: 100%; max-width: 400px; background-color: #2a2a2a; color: white; border: 1px solid #444; border-radius: 5px;">
        <option value="" style="background-color: #2a2a2a;">-- Sélectionnez une discipline --</option>
        <optgroup label="🎯 PISTOLET" style="background-color: #ffc107; color: black; font-weight: bold;">
            <option value="Pistolet 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 10m</option>
            <option value="Pistolet Standard 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Standard 10m</option>
            <option value="Pistolet Vitesse 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Vitesse 10m</option>
            <option value="Pistolet 25m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 25m</option>
            <option value="Percussion Centrale" style="background-color: #2a2a2a; color: white; font-weight: normal;">Percussion Centrale</option>
            <option value="Pistolet Standard 25m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet Standard 25m</option>
            <option value="Vitesse Olympique" style="background-color: #2a2a2a; color: white; font-weight: normal;">Vitesse Olympique</option>
            <option value="Pistolet 50m Libre" style="background-color: #2a2a2a; color: white; font-weight: normal;">Pistolet 50m Libre</option>
        </optgroup>
        <optgroup label="🎯 CARABINE" style="background-color: #ffc107; color: black; font-weight: bold;">
            <option value="Carabine 10m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 10m</option>
            <option value="Carabine 60 balles couché - 50m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 60 balles couché - 50m</option>
            <option value="Carabine 3x20 - 50m" style="background-color: #2a2a2a; color: white; font-weight: normal;">Carabine 3x20 - 50m</option>
        </optgroup>
      </select>
    </div>

    <div class="card" id="conteneur-graphique" style="background-color: white; padding: 20px; display: none;">
      <canvas id="graphProgression"></canvas>
    </div>
    <p id="message-stats" style="margin-top: 20px; color: var(--color-text);"></p>
  `
};

const configDisciplines = {
  // --- PISTOLET ---
  "pistolet10m": {
    nom: "Pistolet 10m",
    dossierAudio: null, 
    maxMouches: 60,
    tables: [{ id: "Séries", label: "Séries", nbSeries: 6, coupsParSerie: 10, maxScore: 10, type: "number", essai: false }]
  },
  "standard10m": {
    nom: "Pistolet Standard 10m",
    dossierAudio: "Standard 10m",
    nbSeriesAudio: 8,
    tempsDefauts: { chargement: 60, attention: 7, tir: 10, repos: 30 },
    maxMouches: 40,
    tables: [{ id: "Séries", label: "Séries", nbSeries: 8, coupsParSerie: 5, maxScore: 50, type: "number", essai: true }]
  },
  "vitesse10m": {
    nom: "Pistolet Vitesse 10m",
    dossierAudio: "Vitesse 10m",
    nbSeriesAudio: 8,
    tempsDefauts: { chargement: 60, attention: 7, tir: 10, repos: 30 },
    maxMouches: 0, 
    tables: [{ id: "Gongs", label: "Gongs", nbSeries: 8, coupsParSerie: 5, maxScore: 1, type: "checkbox", essai: true }]
  },
  "pistolet25m": {
    nom: "Pistolet 25m",
    dossierAudio: "37",
    nbSeriesAudio: 6,
    tempsDefauts: { chargement: 60, attention: 7, tir: 3, repos: 30 }, 
    maxMouches: 60,
    tables: [
      { id: "Précision", label: "Précision", nbSeries: 6, coupsParSerie: 5, maxScore: 50, type: "number", essai: true },
      { id: "Vitesse (3/7)", label: "Vitesse (3/7)", nbSeries: 6, coupsParSerie: 5, maxScore: 50, type: "number", essai: true }
    ]
  },
  "percussionCentrale": {
    nom: "Percussion Centrale",
    dossierAudio: "37",
    nbSeriesAudio: 6,
    tempsDefauts: { chargement: 60, attention: 7, tir: 3, repos: 30 }, 
    maxMouches: 60,
    tables: [
      { id: "Précision", label: "Précision", nbSeries: 6, coupsParSerie: 5, maxScore: 50, type: "number", essai: true },
      { id: "Vitesse (3/7)", label: "Vitesse (3/7)", nbSeries: 6, coupsParSerie: 5, maxScore: 50, type: "number", essai: true }
    ]
  },
  "standard25m": {
    nom: "Pistolet Standard 25m",
    dossierAudio: "Standard 25m",
    nbSeriesAudio: 12, 
    tempsDefauts: { chargement: 60, attention: 7, tir: 150, repos: 30 },
    maxMouches: 60,
    tables: [
      { id: "150 secondes", label: "150 secondes", nbSeries: 4, coupsParSerie: 5, maxScore: 50, type: "number", essai: true },
      { id: "20 secondes", label: "20 secondes", nbSeries: 4, coupsParSerie: 5, maxScore: 50, type: "number", essai: false },
      { id: "10 secondes", label: "10 secondes", nbSeries: 4, coupsParSerie: 5, maxScore: 50, type: "number", essai: false }
    ]
  },
  "vitesseOlympique": {
    nom: "Vitesse Olympique",
    dossierAudio: "Vitesse Olympique",
    nbSeriesAudio: 6, 
    tempsDefauts: { chargement: 60, attention: 7, tir: 8, repos: 30 },
    maxMouches: 60,
    tables: [
      { id: "Partie 1", label: "Partie 1", nbSeries: 6, coupsParSerie: 5, maxScore: 10, type: "number", essai: true },
      { id: "Partie 2", label: "Partie 2", nbSeries: 6, coupsParSerie: 5, maxScore: 10, type: "number", essai: true }
    ]
  },
  "50mlibre": {
    nom: "Pistolet 50m Libre",
    dossierAudio: null, 
    maxMouches: 60,
    tables: [{ id: "Séries", label: "Séries", nbSeries: 6, coupsParSerie: 10, maxScore: 10, type: "number", essai: false }]
  },

  // --- CARABINES ---
  "carabine10m": {
    nom: "Carabine 10m",
    dossierAudio: null, 
    maxMouches: 60,
    tables: [{ id: "Séries", label: "Séries", nbSeries: 6, coupsParSerie: 10, maxScore: 10.9, type: "decimal", essai: false }]
  },
  "carabine60couche": {
    nom: "Carabine 60 balles couché - 50m",
    dossierAudio: null, 
    maxMouches: 60,
    tables: [{ id: "Séries", label: "Séries", nbSeries: 6, coupsParSerie: 10, maxScore: 10.9, type: "decimal", essai: false }]
  },
  "carabine3x20": {
    nom: "Carabine 3x20 - 50m",
    dossierAudio: null, 
    maxMouches: 60,
    tables: [
      { id: "Genou", label: "Genou (20 tirs)", nbSeries: 2, coupsParSerie: 10, maxScore: 10, type: "number", essai: false },
      { id: "Couché", label: "Couché (20 tirs)", nbSeries: 2, coupsParSerie: 10, maxScore: 10, type: "number", essai: false },
      { id: "Debout", label: "Debout (20 tirs)", nbSeries: 2, coupsParSerie: 10, maxScore: 10, type: "number", essai: false }
    ]
  }
};