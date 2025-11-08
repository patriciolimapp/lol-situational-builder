const express = require('express');
const app = express();
const port = 3000;

// --- Cargar Herramientas ---
const cors = require('cors');
app.use(cors()); // Permite que React hable con este servidor
app.use(express.json()); // Permite al servidor entender JSON

// --- Cargar Datos de LoL ---
const championData = require('./data/champion.json').data;
const itemData = require('./data/item.json').data;

console.log("Datos de campeones e items cargados en el 'Cerebro'.");

// --- "ENDPOINT" DE ANÁLISIS (El Corazón de la App) ---
app.post('/api/analyze', (req, res) => {
  const { blueTeam, redTeam } = req.body;

  console.log("--- DATOS RECIBIDOS PARA ANÁLISIS ---");
  console.log("Equipo Rojo (Enemigos):", redTeam);

  // --- INICIO DE LA LÓGICA DE ANÁLISIS ---

  // 1. Contadores para el equipo enemigo
  let enemyDamageType = {
    physical: 0, // Daño Físico (AD)
    magic: 0,    // Daño Mágico (AP)
  };
  let enemyHasHealers = false;
  let enemyHasTanks = false;

  // 2. Analizar a cada campeón enemigo
  redTeam.forEach(championId => {
    if (!championId) return; // Saltar si el selector está vacío

    const champion = championData[championId];
    if (!champion) return;

    // Analizar "tags" del campeón (ej: "Mage", "Tank", "Fighter")
    const tags = champion.tags;
    
    // Lógica simple:
    if (tags.includes('Mage')) {
      enemyDamageType.magic++;
    }
    if (tags.includes('Fighter') || tags.includes('Marksman')) {
      enemyDamageType.physical++;
    }
    if (tags.includes('Tank')) {
      enemyHasTanks = true;
    }
    // Lógica simple para curaciones (ampliar en el futuro)
    if (championId === 'Soraka' || championId === 'Sona' || championId === 'Yuumi' || championId === 'Aatrox' || championId === 'Vladimir') {
      enemyHasHealers = true;
    }
  });

  // 3. Crear el objeto de sugerencias
  let suggestions = {
    defensive: [], // Sugerencias defensivas
    offensive: []  // Sugerencias ofensivas
  };

  // 4. Llenar las sugerencias basado en el análisis
  if (enemyDamageType.magic >= 2) {
    suggestions.defensive.push("Comprar Resistencia Mágica (MR). El equipo enemigo tiene mucho daño AP.");
    suggestions.defensive.push(itemData['3156']); // Fauces de Malmortius
  }

  if (enemyDamageType.physical >= 2) {
    suggestions.defensive.push("Comprar Armadura. El equipo enemigo tiene mucho daño AD.");
    suggestions.defensive.push(itemData['3110']); // Corazón de Hielo
  }

  if (enemyHasHealers) {
    suggestions.offensive.push("Comprar Heridas Graves (Anti-curación). El enemigo tiene mucha curación.");
    suggestions.offensive.push(itemData['3123']); // Llamado del Verdugo
  }

  if (enemyHasTanks) {
    suggestions.offensive.push("Comprar Penetración. El enemigo tiene tanques.");
    suggestions.offensive.push(itemData['3036']); // Recuerdos de Lord Dominik
  }

  // Si no hay amenazas claras
  if (suggestions.defensive.length === 0 && suggestions.offensive.length === 0) {
    suggestions.defensive.push("El equipo enemigo está balanceado. Construye tu build estándar.");
  }
  
  console.log("Sugerencias generadas:", suggestions);

  // --- FIN DE LA LÓGICA ---

  // 5. Devolver las sugerencias al Front-end
  res.json({
    message: "¡Análisis completado!",
    analysis: suggestions
  });
});

// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`El "Cerebro" está escuchando en http://localhost:${port}`);
});