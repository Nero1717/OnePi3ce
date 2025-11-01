import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedCrop, setSelectedCrop] = useState('all'); // Par défaut : toutes les cultures
  const [cells, setCells] = useState([]);
  const [sensors, setSensors] = useState([]);
  const svgRef = useRef(null);

  // Configuration des cultures
  const cropsConfig = {
    all: {
      name: 'Toutes les cultures',
      parcels: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26', 'C27', 'C28', 'C29', 'C30', 'C31', 'C32'],
      color: '#9575cd',
      icon: '🌾'
    },
    tomates: {
      name: 'Tomates',
      parcels: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
      color: '#ff4444',
      icon: '🍅'
    },
    oignons: {
      name: 'Oignons', 
      parcels: ['C9', 'C10', 'C11', 'C12', 'C13', 'C14'],
      color: '#ffaa00',
      icon: '🧅'
    },
    menthe: {
      name: 'Menthe',
      parcels: ['C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24', 'C25', 'C26', 'C27', 'C28', 'C29', 'C30', 'C31', 'C32'],
      color: '#44aa44',
      icon: '🌿'
    }
  };

  // Initialisation du SVG
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const cols = 8;
    const rows = 4;
    const padding = 10;
    const width = 960 - padding * 2;
    const height = 480 - padding * 2;
    const cellW = width / cols;
    const cellH = height / rows;

    const newCells = [];
    const newSensors = [];

    // Création des carrés (32 cellules)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padding + c * cellW;
        const y = padding + r * cellH;
        const cx = x + cellW / 2;
        const cy = y + cellH / 2;
        const cellId = `C${r * cols + c + 1}`;
        
        // Déterminer la culture de cette cellule
        const crop = Object.keys(cropsConfig).find(crop => 
          cropsConfig[crop].parcels.includes(cellId) && crop !== 'all'
        );

        // Statut aléatoire (soif ou sain)
        const needsWater = Math.random() > 0.6;

        newCells.push({
          id: cellId,
          x, y, cx, cy, cellW, cellH,
          crop,
          needsWater,
          temperature: Math.floor(Math.random() * 15) + 20,
          humidity: Math.floor(Math.random() * 50) + 30
        });
      }
    }

    // Création des capteurs (9x5 = 45 capteurs)
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const x = padding + c * cellW;
        const y = padding + r * cellH;
        const size = Math.min(cellW, cellH) * 0.1;

        newSensors.push({
          id: `S${r}-${c}`,
          x, y, size,
          points: `${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`
        });
      }
    }

    setCells(newCells);
    setSensors(newSensors);
  }, []);

  // Gérer le clic sur une cellule
  const handleCellClick = (cellId) => {
    setCells(prev => prev.map(cell => 
      cell.id === cellId 
        ? { ...cell, needsWater: !cell.needsWater }
        : cell
    ));
  };

  // Obtenir la couleur d'une cellule
  const getCellColor = (cell) => {
    if (selectedCrop !== 'all' && cell.crop !== selectedCrop) {
      return '#bdbdbd'; // Gris pour les cultures non sélectionnées
    }
    return cell.needsWater ? '#FF6B6B' : '#7ED957';
  };

  // Obtenir l'opacité d'une cellule
  const getCellOpacity = (cell) => {
    if (selectedCrop === 'all') {
      return 1; // Toutes les cultures visibles
    }
    return cell.crop === selectedCrop ? 1 : 0.4;
  };

  // Vérifier si une cellule doit être cliquable
  const isCellClickable = (cell) => {
    return selectedCrop === 'all' || cell.crop === selectedCrop;
  };

  // Statistiques
  const stats = {
    total: cells.length,
    soif: cells.filter(c => c.needsWater).length,
    humide: cells.filter(c => !c.needsWater).length,
    byCrop: Object.keys(cropsConfig).reduce((acc, crop) => {
      if (crop === 'all') {
        acc[crop] = cells.filter(c => c.needsWater).length;
      } else {
        acc[crop] = cells.filter(c => c.crop === crop && c.needsWater).length;
      }
      return acc;
    }, {})
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">🌱</div>
          <h1>FarmSmart</h1>
          <p>Mabrouka</p>
        </div>

        <div className="plants-menu">
          {Object.entries(cropsConfig).map(([key, crop]) => (
            <div 
              key={key}
              className={`plant-item ${selectedCrop === key ? 'active' : ''}`}
              onClick={() => setSelectedCrop(key)}
              style={{ borderLeftColor: crop.color }}
            >
              <div className="plant-image">{crop.icon}</div>
              <div className="plant-info">
                <h3>{crop.name}</h3>
                <p>{crop.parcels.length} parcelles</p>
                <div className="plant-stats">
                  <span className={`water-indicator ${stats.byCrop[key] > 0 ? 'soif' : 'ok'}`}>
                    {stats.byCrop[key]} assoiffées
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="status-summary">
          <h3>📊 Statut Global</h3>
          <div className="status-item">
            <span className="status-dot soif"></span>
            <span>Parcelles assoiffées: {stats.soif}</span>
          </div>
          <div className="status-item">
            <span className="status-dot humide"></span>
            <span>Parcelles saines: {stats.humide}</span>
          </div>
          <div className="status-item">
            <span className="status-dot total"></span>
            <span>Total parcelles: {stats.total}</span>
          </div>
        </div>

        <div className="quick-actions">
          <h3>⚡ Actions Rapides</h3>
          <button 
            className="action-btn emergency"
            onClick={() => {
              let cellsToWater = [];
              if (selectedCrop === 'all') {
                cellsToWater = cells.filter(c => c.needsWater);
              } else {
                cellsToWater = cells.filter(c => c.crop === selectedCrop && c.needsWater);
              }
              cellsToWater.forEach(cell => handleCellClick(cell.id));
            }}
          >
            💧 Arroser {selectedCrop === 'all' ? 'Tout' : cropsConfig[selectedCrop].name}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="map-header">
          <h2>Terrain de Mabrouka</h2>
          <div className="crop-info">
            <span 
              className="crop-tag"
              style={{ backgroundColor: cropsConfig[selectedCrop].color }}
            >
              {cropsConfig[selectedCrop].icon} {cropsConfig[selectedCrop].name}
            </span>
            <p>
              {selectedCrop === 'all' 
                ? 'Visualisation de toutes les cultures' 
                : `Visualisation des parcelles de ${cropsConfig[selectedCrop].name.toLowerCase()}`
              }
            </p>
          </div>
        </div>

        {/* Carte SVG */}
        <div className="map-container">
          <svg 
            ref={svgRef} 
            id="terrain" 
            width="960" 
            height="480"
            viewBox="0 0 960 480"
          >
            {/* Cellules (8x4 = 32) */}
            {cells.map(cell => (
              <g 
                key={cell.id} 
                className="cell-group"
                onClick={() => isCellClickable(cell) && handleCellClick(cell.id)}
                style={{ cursor: isCellClickable(cell) ? 'pointer' : 'not-allowed' }}
              >
                {/* Rectangle de la cellule */}
                <rect
                  x={cell.x}
                  y={cell.y}
                  width={cell.cellW}
                  height={cell.cellH}
                  fill={getCellColor(cell)}
                  opacity={getCellOpacity(cell)}
                  stroke="#2d5016"
                  strokeWidth="2"
                  className="cell"
                />
                
                {/* Label de la cellule */}
                <text
                  x={cell.cx}
                  y={cell.cy - 15}
                  textAnchor="middle"
                  className="cell-label"
                  fill={selectedCrop === 'all' || cell.crop === selectedCrop ? '#000' : '#666'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  {cell.id}
                </text>

                {/* Informations supplémentaires */}
                <text
                  x={cell.cx}
                  y={cell.cy + 5}
                  textAnchor="middle"
                  className="cell-info"
                  fill={selectedCrop === 'all' || cell.crop === selectedCrop ? '#333' : '#888'}
                  fontSize="10"
                >
                  {cell.temperature}°C
                </text>
                
                <text
                  x={cell.cx}
                  y={cell.cy + 18}
                  textAnchor="middle"
                  className="cell-info"
                  fill={selectedCrop === 'all' || cell.crop === selectedCrop ? '#333' : '#888'}
                  fontSize="10"
                >
                  {cell.humidity}%
                </text>

                {/* Pompe (cercle au centre) */}
                <circle
                  cx={cell.cx}
                  cy={cell.cy}
                  r="8"
                  fill="#1a237e"
                  opacity={getCellOpacity(cell)}
                  className="pump"
                />

                {/* Indicateur de culture */}
                {cell.crop && (
                  <text
                    x={cell.x + 8}
                    y={cell.y + 15}
                    className="crop-icon"
                    fontSize="14"
                    opacity={getCellOpacity(cell)}
                  >
                    {cropsConfig[cell.crop]?.icon}
                  </text>
                )}

                {/* Alerte si besoin d'eau */}
                {cell.needsWater && (selectedCrop === 'all' || cell.crop === selectedCrop) && (
                  <text
                    x={cell.x + cell.cellW - 15}
                    y={cell.y + 15}
                    className="water-alert"
                    fontSize="16"
                    fill="#ff4444"
                  >
                    💧
                  </text>
                )}
              </g>
            ))}

            {/* Capteurs (9x5 = 45) */}
            {sensors.map(sensor => (
              <polygon
                key={sensor.id}
                points={sensor.points}
                fill="#2d5016"
                className="sensor"
                opacity="0.7"
              />
            ))}
          </svg>
        </div>

        {/* Légende */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color soif"></div>
            <span>Soif - Besoin d'eau</span>
          </div>
          <div className="legend-item">
            <div className="legend-color humide"></div>
            <span>Saine - Niveau OK</span>
          </div>
          <div className="legend-item">
            <div className="pump-legend">●</div>
            <span>Pompe/Sprinkler</span>
          </div>
          <div className="legend-item">
            <div className="sensor-legend">▲</div>
            <span>Capteur</span>
          </div>
          <div className="legend-item">
            <div className="focus-legend"></div>
            <span>Culture sélectionnée</span>
          </div>
          <div className="legend-item">
            <div className="blurred-legend"></div>
            <span>Autres cultures</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;