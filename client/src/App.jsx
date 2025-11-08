import { useState } from 'react'
import './App.css'
import championData from './data/champion.json'

// --- Componente ChampionSelector ---
function ChampionSelector({ value, onChange }) {
  const championList = Object.values(championData.data);
  return (
    <select value={value} onChange={onChange}>
      <option value="">Selecciona un campeón...</option>
      {championList.map((champion) => (
        <option key={champion.id} value={champion.id}>
          {champion.name}
        </option>
      ))}
    </select>
  )
}

// --- Componente App ---
function App() {
  const [blueTeam, setBlueTeam] = useState(Array(5).fill(''));
  const [redTeam, setRedTeam] = useState(Array(5).fill(''));

  // --- ¡NUEVO ESTADO! ---
  // Para guardar los resultados que vienen del "Cerebro"
  const [results, setResults] = useState(null);

  const handleSelectChange = (team, setTeam, index, event) => {
    const newTeam = [...team];
    newTeam[index] = event.target.value;
    setTeam(newTeam);
  };

  // --- FUNCIÓN DE ANÁLISIS (MODIFICADA) ---
  const handleAnalyzeClick = async () => {
    console.log("Enviando datos al 'Cerebro'...");
    setResults(null); // Limpiar resultados anteriores

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blueTeam: blueTeam,
          redTeam: redTeam
        }),
      });

      const data = await response.json();

      console.log("Respuesta del 'Cerebro':", data);
      
      // --- ¡NUEVO! ---
      // Guardamos el análisis en nuestro estado
      setResults(data.analysis); 

    } catch (error) {
      console.error("Error al conectar con el 'Cerebro':", error);
      alert("Error: No se pudo conectar al servidor. ¿Está encendido?");
    }
  };

  return (
    <div className="App">
      <h1>LoL Situational Builder</h1>
      <div className="champion-selectors">
        {/* ... (Tu código de selectores, no cambia) ... */}
        <div className="team-selector blue-team">
          <h2>Tu Equipo</h2>
          {blueTeam.map((championId, index) => (
            <ChampionSelector
              key={index}
              value={championId}
              onChange={(e) => handleSelectChange(blueTeam, setBlueTeam, index, e)}
            />
          ))}
        </div>
        <div className="team-selector red-team">
          <h2>Equipo Enemigo</h2>
          {redTeam.map((championId, index) => (
            <ChampionSelector
              key={index}
              value={championId}
              onChange={(e) => handleSelectChange(redTeam, setRedTeam, index, e)}
            />
          ))}
        </div>
      </div>
      
      <button onClick={handleAnalyzeClick}>Analizar Partida</button>
      
      {/* --- ¡NUEVA SECCIÓN DE RESULTADOS! --- */}
      <div className="results">
        {/* Solo mostramos esto si 'results' tiene algo */}
        {results && (
          <>
            <h3>Sugerencias Defensivas:</h3>
            <ul>
              {results.defensive.map((item, index) => (
                <li key={index}>
                  {/* Si es un string, lo muestra. Si es un item, muestra el nombre. */}
                  {typeof item === 'string' ? item : item.name}
                </li>
              ))}
            </ul>

            <h3>Sugerencias Ofensivas:</h3>
            <ul>
              {results.offensive.map((item, index) => (
                <li key={index}>
                  {typeof item === 'string' ? item : item.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

    </div>
  )
}

export default App