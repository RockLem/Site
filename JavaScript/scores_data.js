/* ==========================================================================
   FICHIER 3 : GESTION DES SCORES ET HISTORIQUE LOCAL
   ========================================================================== */
function validerInput(input, max) {
  let val = parseInt(input.value, 10);
  if (isNaN(val) || val < 0) { input.value = ""; return; }
  if (val > max) val = max;
  input.value = val;
}

function validerDecimal(input, max) {
  let val = input.value;
  if (val === "") return;
  let floatVal = parseFloat(val);
  if (floatVal > max) input.value = max;
  if (floatVal < 0) input.value = 0;
}

function blurDecimal(input) {
  let val = input.value;
  if (val === "") return;
  let floatVal = parseFloat(val);
  if (!isNaN(floatVal)) {
      if (floatVal > 0 && floatVal < 1) {
          input.value = 0;
      } else {
          input.value = floatVal.toFixed(1);
      }
  }
}

function genererGrille(disciplineKey) {
  const container = document.getElementById("grille-container");
  const titre = document.getElementById("titre-discipline");
  const boutonAudioContainer = document.getElementById("bouton-audio-container");
  const zoneSauvegarde = document.getElementById("zone-sauvegarde");
  
  if (!disciplineKey || !configDisciplines[disciplineKey]) {
    container.innerHTML = "";
    titre.textContent = "";
    boutonAudioContainer.innerHTML = "";
    zoneSauvegarde.style.display = "none";
    return;
  }

  const config = configDisciplines[disciplineKey];
  titre.textContent = config.nom;
  const aUnEssai = config.tables.some(t => t.essai === true); 
  
  if (config.dossierAudio) {
    boutonAudioContainer.innerHTML = `
      <div class="card" style="background-color: rgba(0, 123, 255, 0.05); border: 1px solid var(--color-primary); padding: 15px;">
        <h3 style="margin-top: 0; color: var(--color-primary);">⚙️ Configuration du Match</h3>
        
        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 15px;">
            <label style="font-weight: bold; cursor: pointer;">
              <input type="checkbox" id="checkPrepa" style="transform: scale(1.5); margin-right: 8px;" checked> 
              3 min de préparation
            </label>
            <label style="font-weight: bold; cursor: pointer; ${!aUnEssai ? 'display:none;' : ''}">
              <input type="checkbox" id="checkEssai" style="transform: scale(1.5); margin-right: 8px;" checked> 
              Série d'essai
            </label>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-bottom: 20px;">
          <div><label>Charge (s)</label><br><input type="number" id="t-chargement" value="${config.tempsDefauts.chargement}" style="width: 70px;"></div>
          <div><label>Attention (s)</label><br><input type="number" id="t-attention" value="${config.tempsDefauts.attention}" style="width: 70px;"></div>
          <div><label>Tir (s)</label><br><input type="number" id="t-tir" value="${config.tempsDefauts.tir}" style="width: 70px;"></div>
          <div><label>Repos (s)</label><br><input type="number" id="t-repos" value="${config.tempsDefauts.repos}" style="width: 70px;"></div>
        </div>

        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button onclick="lancerSequenceMatch('${disciplineKey}')" style="background-color: #28a745;">🔊 Démarrer le Match</button>
            <button id="btn-pause-seq" onclick="mettreEnPause()" style="background-color: #17a2b8;">⏸️ Pause</button>
            <button onclick="passerAuSuivant()" style="background-color: #ffc107; color: black; font-weight: bold;" title="Passe le temps d'attente en cours">⏭️ Passer</button>
            <button onclick="stopperSequence()" style="background-color: #dc3545;">⏹️ Stopper</button>
        </div>
        
        <div id="sequence-status" style="margin-top: 20px; text-align: center; font-size: 20px; color: var(--color-primary); font-weight: bold; background: rgba(0, 123, 255, 0.1); border-radius: 8px; padding: 15px; border: 1px solid var(--color-primary); display: none;">
           ⏳ Prêt à démarrer
        </div>
      </div>
    `;
  } else {
    boutonAudioContainer.innerHTML = "";
  }
  
  let html = "";

  config.tables.forEach(table => {
    let isDecimal = table.type === "decimal";
    let isCheckbox = table.type === "checkbox";
    
    let maxHeaderScore = isDecimal ? table.maxScore.toFixed(1) : table.maxScore;
    let nbInputs = (table.maxScore <= 10.9 && table.coupsParSerie > 1) ? table.coupsParSerie : 1;

    html += `<h3>${table.label}</h3>`;
    html += `<table id="${table.id.replace(/\s+/g, '')}"><thead><tr><th>Série</th>`;
    
    if (isCheckbox) {
        for(let c = 1; c <= table.coupsParSerie; c++) html += `<th>Gong ${c}</th>`;
        html += `<th>Total</th>`;
    } else {
        if (nbInputs > 1) {
            html += `<th colspan="${nbInputs}">Coups (0-${maxHeaderScore})</th>`;
        } else {
            html += `<th>Score (0-${maxHeaderScore})</th>`;
        }
    }
    html += `</tr></thead><tbody>`;

    const getCells = () => {
        let cells = "";
        if (isCheckbox) {
            for(let c = 1; c <= table.coupsParSerie; c++) {
                cells += `<td><input type="checkbox" onchange="majTotalGongs(this, '${table.id.replace(/\s+/g, '')}')"></td>`;
            }
            cells += `<td class="row-total">0</td>`;
        } else if (isDecimal) {
            for(let c = 1; c <= nbInputs; c++) {
                cells += `<td><input type="number" step="0.1" min="0" max="${table.maxScore}" oninput="validerDecimal(this, ${table.maxScore})" onblur="blurDecimal(this)"></td>`;
            }
        } else {
            for(let c = 1; c <= nbInputs; c++) {
                cells += `<td><input type="number" min="0" max="${table.maxScore}" oninput="validerInput(this, ${table.maxScore})"></td>`;
            }
        }
        return cells;
    };

    if (table.essai) {
      html += `<tr class="ligne-essai" style="background-color: rgba(255, 193, 7, 0.2);"><td>Essai</td>${getCells()}</tr>`;
    }

    for (let s = 1; s <= table.nbSeries; s++) {
      html += `<tr><td>Série ${s}</td>${getCells()}</tr>`;
    }
    html += `</tbody>`;
    
    if (isCheckbox) {
       html += `<tfoot><tr><td colspan="${table.coupsParSerie + 1}" style="text-align: right;"><strong>Total général</strong></td><td id="total-${table.id.replace(/\s+/g, '')}">0 / ${table.nbSeries * table.coupsParSerie}</td></tr></tfoot>`;
    }
    html += `</table>`;
  });

  if (config.maxMouches > 0) {
    html += `
      <div class="card" style="margin-top: 20px; padding: 15px;">
        <strong>Mouches (Max ${config.maxMouches}) : </strong>
        <input type="number" id="mouchesGlobal" value="0" min="0" max="${config.maxMouches}" oninput="validerInput(this, ${config.maxMouches})" style="width: 80px; font-size: 16px;">
      </div>
    `;
  }

  container.innerHTML = html;
  zoneSauvegarde.style.display = "block";
}

function majTotalGongs(checkbox, tableId) {
  const row = checkbox.closest('tr');
  const rowTotal = row.querySelectorAll("input[type='checkbox']:checked").length;
  row.querySelector(".row-total").textContent = rowTotal;
  
  const tableEl = document.getElementById(tableId);
  const rows = Array.from(tableEl.querySelectorAll("tbody tr:not(.ligne-essai)"));
  const total = rows.reduce((sum, r) => sum + (parseInt(r.querySelector(".row-total").textContent) || 0), 0);
  
  const totalFooter = document.getElementById(`total-${tableId}`);
  if(totalFooter) {
    const max = rows.length * 5; 
    totalFooter.textContent = `${total} / ${max}`;
  }
}

function enregistrerScoreDynamique() {
  const disciplineSelect = document.getElementById("choixDiscipline");
  if (!disciplineSelect || !disciplineSelect.value) return;

  const disciplineKey = disciplineSelect.value;
  const config = configDisciplines[disciplineKey];
  const date = new Date().toLocaleString("fr-FR");

  let totalGlobal = 0;
  let detailsObj = {};

  config.tables.forEach(table => {
    const tableIdNettoye = table.id.replace(/\s+/g, '');
    const tableEl = document.getElementById(tableIdNettoye);
    if (!tableEl) return;
    
    const rows = Array.from(tableEl.querySelectorAll("tbody tr:not(.ligne-essai)"));
    
    let seriesTotals = rows.map(row => {
        if (table.type === "checkbox") {
            return parseInt(row.querySelector(".row-total").textContent) || 0;
        } else if (table.type === "decimal") {
            const inputs = Array.from(row.querySelectorAll("input[type='number']"));
            let sum = inputs.reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
            return parseFloat(sum.toFixed(1)); 
        } else {
            const inputs = Array.from(row.querySelectorAll("input[type='number']"));
            return inputs.reduce((sum, input) => sum + (parseInt(input.value, 10) || 0), 0);
        }
    });

    if (table.coupsParSerie === 5 && disciplineKey !== "vitesse10m") {
        let grouped = [];
        for (let i = 0; i < seriesTotals.length; i += 2) {
            let s1 = seriesTotals[i] || 0;
            let s2 = seriesTotals[i+1] || 0;
            if (table.type === "decimal") {
                grouped.push(parseFloat((s1 + s2).toFixed(1)));
            } else {
                grouped.push(s1 + s2);
            }
        }
        seriesTotals = grouped;
    }
    
    const sousTotal = seriesTotals.reduce((a, b) => a + b, 0);
    totalGlobal += sousTotal;
    
    detailsObj[table.label] = seriesTotals; 
  });

  totalGlobal = parseFloat(totalGlobal.toFixed(1));

  const mouchesInput = document.getElementById("mouchesGlobal");
  const mouches = mouchesInput ? (parseInt(mouchesInput.value, 10) || 0) : 0;

  let scoreTheoriqueMax = 0;
  config.tables.forEach(t => {
      if (t.type === "checkbox") {
          scoreTheoriqueMax += (t.nbSeries * t.coupsParSerie); 
      } else if (t.maxScore <= 10.9 && t.coupsParSerie > 1) {
          scoreTheoriqueMax += (t.nbSeries * t.coupsParSerie * t.maxScore);
      } else {
          scoreTheoriqueMax += (t.nbSeries * t.maxScore);
      }
  });
  
  if (scoreTheoriqueMax % 1 !== 0) scoreTheoriqueMax = scoreTheoriqueMax.toFixed(1);

  const historique = JSON.parse(localStorage.getItem("historiqueScores") || "[]");
  historique.push({
    discipline: config.nom,
    score: totalGlobal,
    scoreMax: scoreTheoriqueMax,
    mouches: mouches,
    date: date,
    details: detailsObj
  });

  localStorage.setItem("historiqueScores", JSON.stringify(historique));
  naviguer('historique');
}

function afficherHistorique() {
  const historiqueBrut = JSON.parse(localStorage.getItem("historiqueScores") || "[]");
  const container = document.getElementById("historique-container");
  if (!container) return;

  if (historiqueBrut.length === 0) {
    container.innerHTML = "<p style='padding: 20px;'>Aucun score enregistré pour le moment.</p>";
    return;
  }

  const filtreSelect = document.getElementById("filtreHistorique");
  const filtre = filtreSelect ? filtreSelect.value : "tout";

  let elementsAffiches = historiqueBrut.map((entry, index) => {
      return { data: entry, indexOrigine: index };
  });

  if (filtre !== "tout") {
      elementsAffiches = elementsAffiches.filter(item => item.data.discipline === filtre);
  }

  if (elementsAffiches.length === 0) {
      container.innerHTML = "<p style='padding: 20px;'>Aucun score enregistré pour cette discipline spécifique.</p>";
      return;
  }

  let html = `<table style="width:100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="width: 40px;"><input type="checkbox" onclick="toggleAllCheckboxes(this)"></th>
        <th>Date</th>
        <th>Discipline</th>
        <th>Score</th>
        <th>Détails</th>
      </tr>
    </thead>
    <tbody>`;

  elementsAffiches.slice().reverse().forEach(item => {
    const entry = item.data;
    const vraiIndex = item.indexOrigine; 
    
    let scoreAffiche = entry.score;
    if (entry.mouches > 0) {
      scoreAffiche += `-${entry.mouches}x`;
    }

    html += `<tr>
      <td><input type="checkbox" class="hist-checkbox" data-index="${vraiIndex}"></td>
      <td>${entry.date}</td>
      <td><strong>${entry.discipline}</strong></td>
      <td><strong>${scoreAffiche}</strong> / ${entry.scoreMax}</td>
      <td><button onclick="toggleDetail(${vraiIndex})" style="background-color: #444; padding: 6px 12px; font-size: 14px;">Voir</button></td>
    </tr>`;

    html += `<tr id="detail-row-${vraiIndex}" style="display:none; background-color: rgba(0,0,0,0.05);">
      <td colspan="5" style="text-align: left; padding: 20px;">
        ${genererDetailsHTML(entry)}
      </td>
    </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function genererDetailsHTML(entry) {
    let html = "";
    if (entry.mouches > 0) {
        html += `<strong>Mouches : </strong> ${entry.mouches}<br><br>`;
    }
    
    for (let tableNom in entry.details) {
        let scores = entry.details[tableNom];
        html += `<strong style="color: var(--color-primary);">${tableNom} :</strong> ${scores.join(" | ")}<br>`;
    }
    return html;
}

function toggleDetail(index) {
  const row = document.getElementById(`detail-row-${index}`);
  if (row.style.display === "none") {
      row.style.display = "table-row";
  } else {
      row.style.display = "none";
  }
}

function toggleAllCheckboxes(source) {
  const checkboxes = document.querySelectorAll('.hist-checkbox');
  checkboxes.forEach(cb => cb.checked = source.checked);
}

function supprimerSelection() {
  const checkboxes = document.querySelectorAll('.hist-checkbox:checked');
  if (checkboxes.length === 0) return alert("Sélectionnez au moins un score à supprimer.");
  if (!confirm("Supprimer les scores sélectionnés ?")) return;

  let historique = JSON.parse(localStorage.getItem("historiqueScores") || "[]");
  const indexesToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
  
  indexesToRemove.forEach(index => {
      historique.splice(index, 1);
  });

  localStorage.setItem("historiqueScores", JSON.stringify(historique));
  afficherHistorique(); 
}

function viderHistorique() {
  if(!confirm("Voulez-vous vraiment effacer TOUT l'historique ?")) return;
  localStorage.removeItem("historiqueScores");
  afficherHistorique();
}