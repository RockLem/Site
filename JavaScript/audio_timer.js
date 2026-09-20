/* ==========================================================================
   FICHIER 2 : AUDIO ET SÉQUENCEUR DE MATCH
   ========================================================================== */
// --- PARTIE LECTEUR AUDIO CLASSIQUE ---
let dernierFichier = "";

function jouerSon(fichier) {
  stopperSequence(); 
  const audio = document.getElementById("lecteur");
  dernierFichier = fichier;
  audio.src = "MP3/" + fichier; 
  audio.currentTime = 0;
  audio.play();
}

function playSon() { 
  const audio = document.getElementById("lecteur");
  if (dernierFichier) audio.play(); 
}

function pauseSon() { 
  const audio = document.getElementById("lecteur");
  if(audio) audio.pause(); 
}

function stopSon() { 
  const audio = document.getElementById("lecteur");
  if(audio) {
    audio.pause(); 
    audio.currentTime = 0; 
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("lecteur");
  if (audio) {
    audio.addEventListener("timeupdate", () => {
      const tempsAffiche = document.getElementById("temps");
      const progressBar = document.getElementById("progressBar");
      const courant = formatTemps(audio.currentTime);
      const total = formatTemps(audio.duration);
      
      if(tempsAffiche) tempsAffiche.textContent = `⏱️ ${courant} / ${total}`;
      if(progressBar) {
        progressBar.max = audio.duration || 0;
        progressBar.value = audio.currentTime;
      }
    });
  }

  const progressBar = document.getElementById("progressBar");
  if (progressBar) {
    progressBar.addEventListener("input", () => {
      document.getElementById("lecteur").currentTime = progressBar.value;
    });
  }
});

function formatTemps(sec) {
  if (isNaN(sec)) return "0:00";
  const minutes = Math.floor(sec / 60);
  const secondes = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${minutes}:${secondes}`;
}

function allerAuTemps() {
  const champ = document.getElementById("tempsCible");
  if (!champ) return;
  const input = champ.value.trim();
  
  if (!input.match(/^\d+:\d{2}$/)) {
    alert("Format invalide. Utilisez mm:ss (ex: 2:05)");
    return;
  }
  
  const [min, sec] = input.split(":").map(Number);
  const secondesTotales = (min * 60) + sec;
  const audio = document.getElementById("lecteur");
  
  if (!isNaN(secondesTotales) && secondesTotales <= audio.duration) {
    audio.currentTime = secondesTotales;
  } else {
    alert("Temps invalide ou supérieur à la durée de l'audio.");
  }
}

// --- PARTIE SÉQUENCEUR DE MATCH INTELLIGENT ---
let sequenceActive = false;
let passerEtape = false; 
let sequenceEnPause = false; 

function mettreEnPause() {
  if (!sequenceActive) return; 
  sequenceEnPause = !sequenceEnPause;
  
  const btnPause = document.getElementById("btn-pause-seq");
  const audio = document.getElementById("lecteur");

  if (sequenceEnPause) {
      if (btnPause) {
          btnPause.innerHTML = "▶️ Reprendre";
          btnPause.style.backgroundColor = "#ffc107"; 
          btnPause.style.color = "black";
      }
      if (audio && !audio.paused && !audio.ended && audio.currentTime > 0) {
          audio.pause();
          audio.dataset.interrompuParPause = "true"; 
      } else {
          if (audio) audio.dataset.interrompuParPause = "false";
      }
  } else {
      if (btnPause) {
          btnPause.innerHTML = "⏸️ Pause";
          btnPause.style.backgroundColor = "#17a2b8"; 
          btnPause.style.color = "white";
      }
      if (audio && audio.dataset.interrompuParPause === "true") {
          audio.play().catch(e => console.log(e));
          audio.dataset.interrompuParPause = "false"; 
      }
  }
}

function passerAuSuivant() {
  if (sequenceActive) {
    passerEtape = true;
  }
}

async function attendreAvecCompteARebours(secondes, message) {
  const statusDiv = document.getElementById("sequence-status");
  if (statusDiv) statusDiv.style.display = "block";

  let i = secondes;
  while (i > 0) {
    if (!sequenceActive) {
      if (statusDiv) statusDiv.innerHTML = "⏹️ Séquence stoppée.";
      return;
    }
    
    if (passerEtape) {
      passerEtape = false; 
      return; 
    }

    if (sequenceEnPause) {
        if (statusDiv && !statusDiv.innerHTML.includes("EN PAUSE")) {
            let minutes = Math.floor(i / 60);
            let restes = i % 60;
            let texteTemps = minutes > 0 ? `${minutes}:${restes.toString().padStart(2, '0')}` : `${restes} s`;
            statusDiv.innerHTML = `⏸️ EN PAUSE - ${message}<br><span style="font-size: 36px; color: #ffc107;">${texteTemps}</span>`;
        }
        await new Promise(resolve => setTimeout(resolve, 200)); 
        continue; 
    }

    if (statusDiv) {
      let minutes = Math.floor(i / 60);
      let restes = i % 60;
      let texteTemps = minutes > 0 ? `${minutes}:${restes.toString().padStart(2, '0')}` : `${restes} s`;
      statusDiv.innerHTML = `⏳ ${message}<br><span style="font-size: 36px; color: #dc3545;">${texteTemps}</span>`;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    i--; 
  }
}

function lireSonAsync(chemins) {
  if (!Array.isArray(chemins)) {
      chemins = [chemins];
  }

  return new Promise((resolve) => {
    if (!sequenceActive) return resolve(); 
    
    const audio = document.getElementById("lecteur");
    let index = 0;

    async function essayerProchainFichier() {
      while (sequenceEnPause && sequenceActive) {
          await new Promise(r => setTimeout(r, 200));
      }
      if (!sequenceActive) return resolve();

      if (index >= chemins.length) {
        console.warn("Fichier audio introuvable : ", chemins);
        return resolve(); 
      }
      
      audio.src = encodeURI("MP3.2/" + chemins[index]); 
      
      let handled = false;

      audio.onended = () => {
          if (!handled) { handled = true; resolve(); }
      };
      
      audio.onerror = () => {
          if (!handled) {
              handled = true;
              index++;
              essayerProchainFichier(); 
          }
      };
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(() => {
              if (!handled) {
                  handled = true;
                  index++;
                  essayerProchainFichier(); 
              }
          });
      }
    }

    essayerProchainFichier(); 
  });
}

async function lancerSequenceMatch(disciplineKey) {
  if (sequenceActive) return; 
  sequenceActive = true;
  passerEtape = false;
  sequenceEnPause = false;

  const config = configDisciplines[disciplineKey];
  const dossier = config.dossierAudio;

  const prepa = document.getElementById('checkPrepa').checked;
  const inclureEssai = document.getElementById('checkEssai') ? document.getElementById('checkEssai').checked : false;

  const tChargement = parseInt(document.getElementById('t-chargement').value) || 60;
  const tAttention = parseInt(document.getElementById('t-attention').value) || 7;
  const tRepos = parseInt(document.getElementById('t-repos').value) || 30;

  const nbSeriesMatch = config.nbSeriesAudio || config.tables[0].nbSeries;

  try {
    if (prepa && sequenceActive) {
      await lireSonAsync([`${dossier}/3min prépa.mp3`, `${dossier}/3 min prepa.mp3`]);
      if(!sequenceActive) return;
      await attendreAvecCompteARebours(3 * 60, "Préparation en cours"); 
      
      if(!sequenceActive) return;
      await lireSonAsync([`${dossier}/fin 3min prépa.mp3`, `${dossier}/fin 3 min prepa.mp3`]);
      await attendreAvecCompteARebours(5, "Fin de préparation"); 
    }

    let departBoucle = inclureEssai ? 0 : 1;

    for (let i = departBoucle; i <= nbSeriesMatch; i++) {
      if(!sequenceActive) return;
      const nomSerie = (i === 0) ? "Essai" : `Numéro ${i}`;

      let tTirCourant = parseInt(document.getElementById('t-tir').value) || 10;
      
      if (disciplineKey === 'standard25m') {
          if (i === 0 || i <= 4) tTirCourant = 150;
          else if (i <= 8) tTirCourant = 20;
          else tTirCourant = 10;
      } else if (disciplineKey === 'vitesseOlympique') {
          if (i === 0 || i <= 2) tTirCourant = 8;
          else if (i <= 4) tTirCourant = 6;
          else tTirCourant = 4;
      }

      if (i === 0) {
        await lireSonAsync([
            `${dossier}/série essaie.mp3`, 
            `${dossier}/série essai.mp3`, 
            `${dossier}/serie essaie.mp3`, 
            `${dossier}/serie essai.mp3`
        ]);
      } else {
        await lireSonAsync([
            `${dossier}/série ${i}.mp3`,
            `${dossier}/serie ${i}.mp3`
        ]);
      }

      if(!sequenceActive) return;
      await attendreAvecCompteARebours(tChargement, `Série ${nomSerie} : Chargement`);

      if(!sequenceActive) return;
      await lireSonAsync([`${dossier}/attention.mp3`, `${dossier}/Attention.mp3`]);
      await attendreAvecCompteARebours(tAttention, `Série ${nomSerie} : Attention`);

      if(!sequenceActive) return;
      await lireSonAsync([`${dossier}/bip.mp3`, `${dossier}/Bip.mp3`]);
      
      await attendreAvecCompteARebours(tTirCourant, `🔴 TIR EN COURS (${tTirCourant}s)`);

      if(!sequenceActive) return;
      await lireSonAsync([`${dossier}/bip.mp3`, `${dossier}/Bip.mp3`]);
      await lireSonAsync([`${dossier}/stop décharger.mp3`, `${dossier}/stop decharger.mp3`]);

      if(!sequenceActive) return;
      if (i < nbSeriesMatch) {
        await attendreAvecCompteARebours(tRepos, `Repos avant la suite`);
      }
    }

    if(sequenceActive) {
      const statusDiv = document.getElementById("sequence-status");
      if (statusDiv) statusDiv.innerHTML = "✅ Match terminé ! Pensez à enregistrer vos scores.";
    }

  } catch (erreur) {
    console.error("Erreur Séquenceur :", erreur);
  }

  sequenceActive = false;
  passerEtape = false;
  sequenceEnPause = false;
  const btnPause = document.getElementById("btn-pause-seq");
  if (btnPause) {
      btnPause.innerHTML = "⏸️ Pause";
      btnPause.style.backgroundColor = "#17a2b8";
      btnPause.style.color = "white";
  }
}

function stopperSequence() {
  sequenceActive = false;
  passerEtape = false;
  sequenceEnPause = false; 
  
  const btnPause = document.getElementById("btn-pause-seq");
  if (btnPause) {
      btnPause.innerHTML = "⏸️ Pause";
      btnPause.style.backgroundColor = "#17a2b8";
      btnPause.style.color = "white";
  }

  stopSon();
  const statusDiv = document.getElementById("sequence-status");
  if (statusDiv) {
    statusDiv.style.display = "block";
    statusDiv.innerHTML = "⏹️ Séquence stoppée par l'utilisateur.";
  }
}