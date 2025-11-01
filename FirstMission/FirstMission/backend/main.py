from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import json
import os
import sys

# Simulation de la classe Sensor si BuildData n'existe pas
class Sensor:
    count = 0
    
    def __init__(self, id, temperature, soil_moisture, humidity, latitude, longitude):
        self.id = id
        self.temperature = temperature
        self.soil_moisture = soil_moisture
        self.humidity = humidity
        self.latitude = latitude
        self.longitude = longitude
        Sensor.count += 1

app = Flask(__name__)
CORS(app)

# Variable globale pour stocker la matrice des capteurs
sensor_matrix = []

def load_sensors_data():
    """Charger les données des capteurs depuis les fichiers"""
    global sensor_matrix
    sensors = []
    data_folder = "Data"  # Dossier dans le même répertoire

    # Créer des données simulées si les fichiers n'existent pas
    for i in range(24):
        file_name = f"{data_folder}/Data{i+1:02}.txt"
        
        # Si le fichier n'existe pas, créer des données simulées
        if not os.path.exists(file_name):
            sensor_data = {
                "id": f"Sensor{i+1:02}",
                "temperature": round(20 + (i % 10), 1),
                "soil_moisture": round(30 + (i * 2) % 50, 1),
                "humidity": round(40 + (i * 3) % 40, 1),
                "latitude": round(36.5 + (i // 8) * 0.01, 6),
                "longitude": round(10.1 + (i % 8) * 0.01, 6)
            }
            # Créer le dossier s'il n'existe pas
            os.makedirs(data_folder, exist_ok=True)
            # Sauvegarder les données simulées
            with open(file_name, 'w') as f:
                json.dump(sensor_data, f, indent=2)
        else:
            # Charger les données existantes
            try:
                with open(file_name, "r") as file:
                    sensor_data = json.load(file)
            except Exception as e:
                print(f"❌ Error loading {file_name}: {e}")
                continue

        # Créer l'objet Sensor
        sensors.append(Sensor(
            id=sensor_data["id"],
            temperature=sensor_data["temperature"],
            soil_moisture=sensor_data["soil_moisture"],
            humidity=sensor_data["humidity"],
            latitude=sensor_data["latitude"],
            longitude=sensor_data["longitude"]
        ))

    print(f"✅ Loaded {len(sensors)} sensors.")

    # Trier les capteurs par latitude puis longitude
    sensors.sort(key=lambda s: (s.latitude, s.longitude))

    # Grouper en 8 colonnes, chaque colonne contient 3 capteurs
    cols = 8
    rows = 3
    columns = [sensors[i * rows:(i + 1) * rows] for i in range(cols)]

    # Trier chaque colonne par latitude (sud → nord)
    for column in columns:
        column.sort(key=lambda s: s.latitude)

    # Transposer pour construire une matrice 3x8 (matrix[row][col])
    sensor_matrix = [[columns[col][row] for col in range(cols)] for row in range(rows)]
    
    return sensor_matrix

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    """Endpoint pour récupérer tous les capteurs"""
    try:
        sensors_data = []
        for row in range(len(sensor_matrix)):
            for col in range(len(sensor_matrix[row])):
                sensor = sensor_matrix[row][col]
                
                # Déterminer la culture basée sur la position
                crop = determine_crop(row, col)
                
                sensors_data.append({
                    'id': sensor.id,
                    'temperature': sensor.temperature,
                    'soil_moisture': sensor.soil_moisture,
                    'humidity': sensor.humidity,
                    'latitude': sensor.latitude,
                    'longitude': sensor.longitude,
                    'position': {'row': row, 'col': col},
                    'needsWater': sensor.soil_moisture < 40,
                    'crop': crop,
                    'cellId': f"C{row * 8 + col + 1}"
                })
        
        return jsonify({
            'success': True,
            'sensors': sensors_data,
            'matrix_dimensions': {
                'rows': len(sensor_matrix),
                'cols': len(sensor_matrix[0]) if sensor_matrix else 0
            },
            'total_sensors': len(sensors_data)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def determine_crop(row, col):
    """Déterminer la culture basée sur la position dans la matrice"""
    cell_number = row * 8 + col + 1
    
    if 1 <= cell_number <= 8:
        return 'tomates'
    elif 9 <= cell_number <= 14:
        return 'oignons'
    elif 15 <= cell_number <= 32:
        return 'menthe'
    else:
        return 'unknown'

@app.route('/api/sensors/matrix', methods=['GET'])
def get_sensors_matrix():
    """Endpoint pour récupérer la matrice des capteurs"""
    try:
        matrix_data = []
        for row in range(len(sensor_matrix)):
            row_data = []
            for col in range(len(sensor_matrix[row])):
                sensor = sensor_matrix[row][col]
                row_data.append({
                    'id': sensor.id,
                    'temperature': sensor.temperature,
                    'soil_moisture': sensor.soil_moisture,
                    'humidity': sensor.humidity,
                    'latitude': sensor.latitude,
                    'longitude': sensor.longitude,
                    'needsWater': sensor.soil_moisture < 40,
                    'crop': determine_crop(row, col)
                })
            matrix_data.append(row_data)
        
        return jsonify({
            'success': True,
            'matrix': matrix_data,
            'dimensions': {'rows': len(matrix_data), 'cols': len(matrix_data[0]) if matrix_data else 0}
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sensors/<sensor_id>', methods=['GET'])
def get_sensor(sensor_id):
    """Endpoint pour récupérer un capteur spécifique"""
    try:
        for row in sensor_matrix:
            for sensor in row:
                if sensor.id == sensor_id:
                    return jsonify({
                        'success': True,
                        'sensor': {
                            'id': sensor.id,
                            'temperature': sensor.temperature,
                            'soil_moisture': sensor.soil_moisture,
                            'humidity': sensor.humidity,
                            'latitude': sensor.latitude,
                            'longitude': sensor.longitude,
                            'needsWater': sensor.soil_moisture < 40
                        }
                    })
        
        return jsonify({'success': False, 'error': 'Sensor not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/irrigate', methods=['POST'])
def irrigate():
    """Endpoint pour déclencher l'irrigation"""
    try:
        data = request.get_json()
        sensor_id = data.get('sensor_id')
        
        # Simuler l'irrigation
        print(f"💧 Irrigation déclenchée pour le capteur {sensor_id}")
        
        return jsonify({
            'success': True,
            'message': f'Irrigation démarrée pour {sensor_id}',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de santé de l'API"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'sensors_loaded': len(sensor_matrix) > 0,
        'matrix_size': f"{len(sensor_matrix)}x{len(sensor_matrix[0]) if sensor_matrix else 0}"
    })

# Initialiser les données au démarrage
with app.app_context():
    print("🔄 Initialisation des données des capteurs...")
    load_sensors_data()
    print("✅ Données initialisées avec succès!")

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')