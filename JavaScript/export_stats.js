/* ==========================================================================
   FICHIER 4 : EXPORTATIONS (PDF/CSV) ET STATISTIQUES
   ========================================================================== */
function exporterCSV() {
  const historique = JSON.parse(localStorage.getItem("historiqueScores") || "[]");
  if (historique.length === 0) return alert("Aucun score à exporter.");
  
  let csv = "Date,Discipline,Score,ScoreMax,Mouches\n";
  historique.forEach(entry => {
    csv += `${entry.date},${entry.discipline},${entry.score},${entry.scoreMax},${entry.mouches}\n`;
  });
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "historique_scores.csv";
  link.click();
}

function genererPDF() {
  const checkboxes = document.querySelectorAll('.hist-checkbox:checked');
  if (checkboxes.length === 0) {
      return alert("Sélectionnez au moins un match (case à cocher) pour l'exporter en PDF.");
  }

  const historique = JSON.parse(localStorage.getItem("historiqueScores") || "[]");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let isFirstPage = true;

  Array.from(checkboxes).forEach((cb) => {
      const index = parseInt(cb.dataset.index);
      const entry = historique[index];
      if(!entry) return;

      if (!isFirstPage) {
          doc.addPage();
      }
      isFirstPage = false;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(0, 123, 255);
      doc.text("Feuille de Match - Tir Sportif", 105, 20, null, null, "center");

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      
      doc.text("Tireur : Clément Koutcheroff", 20, 40);
      doc.text("Date : " + entry.date, 20, 50);
      doc.text("Discipline : " + entry.discipline, 20, 60);
      
      let scoreStr = entry.score.toString();
      if (entry.mouches > 0) scoreStr += "-" + entry.mouches + "x";
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Score Total : " + scoreStr + " / " + entry.scoreMax, 20, 75);

      let tableData = [];
      for (let tableNom in entry.details) {
          let scores = entry.details[tableNom];
          tableData.push([tableNom, scores.join(" | ")]);
      }

      doc.autoTable({
          startY: 85,
          head: [['Partie de tir', 'Détail des séries']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [0, 123, 255] }
      });
  });

  const fileName = checkboxes.length === 1 
      ? "Match_" + historique[parseInt(checkboxes[0].dataset.index)].discipline.replace(/\s+/g, '_') + ".pdf" 
      : "Feuilles_de_Match_Tir.pdf";
      
  doc.save(fileName);
}

let chartInstance = null;

function afficherGraphique() {
  const select = document.getElementById("filtreStats");
  if (!select) return;
  const filtre = select.value;
  
  const containerGraph = document.getElementById("conteneur-graphique");
  const messageStats = document.getElementById("message-stats");
  
  if (!filtre) {
      containerGraph.style.display = "none";
      messageStats.textContent = "Veuillez choisir une discipline pour afficher la progression.";
      return;
  }

  const historique = JSON.parse(localStorage.getItem("historiqueScores") || "[]");
  const dataFiltree = historique.filter(item => item.discipline === filtre);

  if (dataFiltree.length === 0) {
      containerGraph.style.display = "none";
      messageStats.textContent = "Aucun score enregistré pour cette discipline.";
      return;
  }

  containerGraph.style.display = "block";
  messageStats.textContent = "";

  const labels = dataFiltree.map(d => d.date.split(' ')[0]); 
  const points = dataFiltree.map(d => d.score);

  const ctx = document.getElementById('graphProgression').getContext('2d');
  
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: 'Score Total (' + filtre + ')',
              data: points,
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              borderWidth: 3,
              pointBackgroundColor: '#ffc107',
              pointRadius: 5,
              fill: true,
              tension: 0.3
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: { 
                  beginAtZero: false 
              }
          }
      }
  });
}