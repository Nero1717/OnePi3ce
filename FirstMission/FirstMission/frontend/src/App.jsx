import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [cells, setCells] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [realSensors, setRealSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [sensorPanelOpen, setSensorPanelOpen] = useState(false);
  const svgRef = useRef(null);

  // Configuration des cultures
  const cropsConfig = {
    all: {
      name: 'Toutes les cultures',
      parcels: Array.from({length: 24}, (_, i) => `C${i + 1}`),
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
      parcels: ['C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24'],
      color: '#44aa44',
      icon: '🌿'
    }
  };

  // Récupérer les données réelles des capteurs depuis le backend
  const fetchSensorsData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sensors');
      const data = await response.json();
     
      if (data.success) {
        setRealSensors(data.sensors);
        console.log('✅ Capteurs réels chargés:', data.sensors);
       
        // Mettre à jour les cellules avec les données réelles
        updateCellsWithRealData(data.sensors);
      }
    } catch (error) {
      console.error('❌ Erreur chargement capteurs réels:', error);
      // En cas d'erreur, utiliser les données simulées
      initializeSimulatedData();
    }
  };

  const updateCellsWithRealData = (sensorsData) => {
    const newCells = sensorsData.map(sensor => {
      const cellId = sensor.cellId;
      const [_, num] = cellId.split('C');
      const cellNum = parseInt(num) - 1;
      const row = Math.floor(cellNum / 8);
      const col = cellNum % 8;
     
      const padding = 10;
      const width = 960 - padding * 2;
      const height = 480 - padding * 2;
      const cellW = width / 8;
      const cellH = height / 3;
     
      const x = padding + col * cellW;
      const y = padding + row * cellH;
      const cx = x + cellW / 2;
      const cy = y + cellH / 2;

      return {
        id: cellId,
        x, y, cx, cy, cellW, cellH,
        crop: sensor.crop,
        needsWater: sensor.needsWater,
        temperature: sensor.temperature,
        humidity: sensor.humidity,
        soil_moisture: sensor.soil_moisture,
        realSensor: sensor
      };
    });

    setCells(newCells);
  };

  const initializeSimulatedData = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const cols = 8;
    const rows = 3;
    const padding = 10;
    const width = 960 - padding * 2;
    const height = 480 - padding * 2;
    const cellW = width / cols;
    const cellH = height / rows;

    const newCells = [];
    const newSensors = [];

    // Création des carrés (24 cellules)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padding + c * cellW;
        const y = padding + r * cellH;
        const cx = x + cellW / 2;
        const cy = y + cellH / 2;
        const cellId = `C${r * cols + c + 1}`;
       
        const crop = Object.keys(cropsConfig).find(crop =>
          cropsConfig[crop].parcels.includes(cellId) && crop !== 'all'
        );

        const realSensor = realSensors.find(s => s.cellId === cellId);
        const needsWater = realSensor ? realSensor.needsWater : Math.random() > 0.6;
        const temperature = realSensor ? realSensor.temperature : Math.floor(Math.random() * 15) + 20;
        const humidity = realSensor ? realSensor.humidity : Math.floor(Math.random() * 50) + 30;

        newCells.push({
          id: cellId,
          x, y, cx, cy, cellW, cellH,
          crop,
          needsWater,
          temperature,
          humidity,
          realSensor
        });
      }
    }

    // Création des capteurs clickable
    const clickableSensors = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const x = padding + c * cellW;
        const y = padding + r * cellH;
        const size = Math.min(cellW, cellH) * 0.15;

        clickableSensors.push({
          id: `S${r}-${c}`,
          x, y, size,
          points: `${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`,
          associatedCell: `C${Math.min(r, rows-1) * cols + Math.min(c, cols-1) + 1}`
        });
      }
    }

    setCells(newCells);
    setSensors(clickableSensors);
  };

  // Gérer le clic sur un capteur
  const handleSensorClick = (sensor) => {
    console.log('🎯 Capteur cliqué:', sensor.id);
   
    const associatedCell = cells.find(cell => cell.id === sensor.associatedCell);
   
    if (associatedCell) {
      const sensorData = {
        id: sensor.id,
        position: `Ligne ${sensor.id.split('-')[0]}, Colonne ${sensor.id.split('-')[1]}`,
        cell: associatedCell,
        realData: associatedCell.realSensor
      };
     
      setSelectedSensor(sensorData);
      setSensorPanelOpen(true);
    }
  };

  // Fermer le panel capteur
  const closeSensorPanel = () => {
    setSensorPanelOpen(false);
    setSelectedSensor(null);
  };

  // Gérer le clic sur une cellule
  const handleCellClick = async (cellId) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    setCells(prev => prev.map(cell =>
      cell.id === cellId
        ? { ...cell, needsWater: !cell.needsWater }
        : cell
    ));

    if (cell.realSensor) {
      try {
        const response = await fetch('http://localhost:5000/api/irrigate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sensor_id: cell.realSensor.id
          })
        });
       
        const data = await response.json();
        if (data.success) {
          console.log('✅ Irrigation commandée:', data.message);
        }
      } catch (error) {
        console.error('❌ Erreur irrigation:', error);
      }
    }
  };

  // Initialisation
  useEffect(() => {
    fetchSensorsData();
  }, []);

  useEffect(() => {
    if (realSensors.length === 0) {
      initializeSimulatedData();
    }
  }, [realSensors]);

  // Obtenir la couleur d'une cellule
  const getCellColor = (cell) => {
    if (selectedCrop !== 'all' && cell.crop !== selectedCrop) {
      return '#bdbdbd';
    }
    return cell.needsWater ? '#FF6B6B' : '#7ED957';
  };

  // Obtenir l'opacité d'une cellule
  const getCellOpacity = (cell) => {
    if (selectedCrop === 'all') {
      return 1;
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
      {/* Sidebar Gauche */}
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
          <div className="status-item">
            <span className="status-dot real-data"></span>
            <span>Données réelles: {realSensors.length > 0 ? '✅' : '❌'}</span>
          </div>
        </div>

        <div className="quick-actions">
          <h3>⚡ Actions Rapides</h3>
          <button
            className="action-btn emergency"
            onClick={async () => {
              let cellsToWater = [];
              if (selectedCrop === 'all') {
                cellsToWater = cells.filter(c => c.needsWater);
              } else {
                cellsToWater = cells.filter(c => c.crop === selectedCrop && c.needsWater);
              }
             
              cellsToWater.forEach(cell => {
                setCells(prev => prev.map(c =>
                  c.id === cell.id ? { ...c, needsWater: false } : c
                ));
              });

              for (const cell of cellsToWater) {
                if (cell.realSensor) {
                  try {
                    await fetch('http://localhost:5000/api/irrigate', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        sensor_id: cell.realSensor.id
                      })
                    });
                  } catch (error) {
                    console.error('❌ Erreur irrigation:', error);
                  }
                }
              }
            }}
          >
            💧 Arroser {selectedCrop === 'all' ? 'Tout' : cropsConfig[selectedCrop].name}
          </button>
         
          <button
            className="action-btn refresh"
            onClick={fetchSensorsData}
          >
            🔄 Actualiser les données
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
              {realSensors.length > 0 ? '✅ Données en temps réel' : '⚠️ Données simulées'}
              {selectedCrop === 'all'
                ? ' - Visualisation de toutes les cultures'
                : ` - Visualisation des parcelles de ${cropsConfig[selectedCrop].name.toLowerCase()}`
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
            {/* Cellules (8x3 = 24) */}
            {cells.map(cell => (
              <g
                key={cell.id}
                className="cell-group"
                onClick={() => isCellClickable(cell) && handleCellClick(cell.id)}
                style={{ cursor: isCellClickable(cell) ? 'pointer' : 'not-allowed' }}
              >
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

                <circle
                  cx={cell.cx}
                  cy={cell.cy}
                  r="8"
                  fill="#1a237e"
                  opacity={getCellOpacity(cell)}
                  className="pump"
                />

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

                {cell.realSensor && (
                  <text
                    x={cell.x + 8}
                    y={cell.y + cell.cellH - 8}
                    className="real-data-indicator"
                    fontSize="10"
                    fill="#2196F3"
                  >
                    📡
                  </text>
                )}
              </g>
            ))}

            {/* Capteurs clickable */}
            {sensors.map(sensor => (
              <g key={sensor.id} className="sensor-group">
                <polygon
                  points={sensor.points}
                  fill={selectedSensor?.id === sensor.id ? "#ffeb3b" : "#2d5016"}
                  stroke={selectedSensor?.id === sensor.id ? "#ff9800" : "none"}
                  strokeWidth={selectedSensor?.id === sensor.id ? "2" : "0"}
                  className="sensor-clickable"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSensorClick(sensor)}
                />
                <circle
                  cx={sensor.x}
                  cy={sensor.y}
                  r="5"
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSensorClick(sensor)}
                />
              </g>
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
            <span>Capteur (clickable)</span>
          </div>
          <div className="legend-item">
            <div className="sensor-selected-legend">🟨</div>
            <span>Capteur sélectionné</span>
          </div>
        </div>
      </div>

      {/* Panel Latéral Droit pour les Capteurs */}
      {sensorPanelOpen && selectedSensor && (
        <div className="sensor-panel">
          <div className="sensor-panel-header">
            <h3>📡 Détails du Capteur</h3>
            <button className="close-panel-btn" onClick={closeSensorPanel}>
              ×
            </button>
          </div>

          <div className="sensor-info">
            <div className="sensor-badge">
              <div className="sensor-icon">▲</div>
              <div className="sensor-identity">
                <h4>{selectedSensor.id}</h4>
                <span className="sensor-position">{selectedSensor.position}</span>
              </div>
            </div>

            <div className="info-section">
              <h4>📍 Localisation</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Cellule</span>
                  <span className="info-value">{selectedSensor.cell.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Culture</span>
                  <span className="info-value">
                    {cropsConfig[selectedSensor.cell.crop]?.icon} {cropsConfig[selectedSensor.cell.crop]?.name}
                  </span>
                </div>
              </div>
            </div>

            {selectedSensor.realData ? (
              <div className="info-section">
                <h4>📊 Données en Temps Réel</h4>
                <div className="data-cards">
                  <div className="data-card temperature">
                    <div className="data-icon">🌡️</div>
                    <div className="data-content">
                      <span className="data-value">{selectedSensor.realData.temperature}°C</span>
                      <span className="data-label">Température</span>
                    </div>
                  </div>
                  <div className="data-card soil-moisture">
                    <div className="data-icon">💧</div>
                    <div className="data-content">
                      <span className="data-value">{selectedSensor.realData.soil_moisture}%</span>
                      <span className="data-label">Humidité Sol</span>
                    </div>
                  </div>
                  <div className="data-card humidity">
                    <div className="data-icon">💨</div>
                    <div className="data-content">
                      <span className="data-value">{selectedSensor.realData.humidity}%</span>
                      <span className="data-label">Humidité Air</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="info-section">
                <h4>📊 Données Simulées</h4>
                <div className="data-cards">
                  <div className="data-card temperature">
                    <div className="data-icon">🌡️</div>
                    <div className="data-content">
                      <span className="data-value">{selectedSensor.cell.temperature}°C</span>
                      <span className="data-label">Température</span>
                    </div>
                  </div>
                  <div className="data-card humidity">
                    <div className="data-icon">💧</div>
                    <div className="data-content">
                      <span className="data-value">{selectedSensor.cell.humidity}%</span>
                      <span className="data-label">Humidité</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="info-section">
              <h4>🚰 Statut Irrigation</h4>
              <div className={`status-indicator ${selectedSensor.cell.needsWater ? 'needs-water' : 'optimal'}`}>
                <div className="status-icon">
                  {selectedSensor.cell.needsWater ? '💧' : '✅'}
                </div>
                <div className="status-content">
                  <span className="status-text">
                    {selectedSensor.cell.needsWater ? 'Besoin d irrigation' : 'Humidité optimale'}
                  </span>
                  <span className="status-desc">
                    {selectedSensor.cell.needsWater
                      ? 'La cellule nécessite une irrigation urgente'
                      : 'Niveau d humidité satisfaisant'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="action-section">
              <button
                className="action-btn primary"
                onClick={() => handleCellClick(selectedSensor.cell.id)}
              >
                {selectedSensor.cell.needsWater ? '💧 Démarrer Irrigation' : '⏸️ Arrêter Irrigation'}
              </button>
              <button
                className="action-btn secondary"
                onClick={closeSensorPanel}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
