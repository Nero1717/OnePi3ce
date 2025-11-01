from datetime import datetime
import json
 
class sensor:

    count = 0
    def __init__(self, id, temperature, soil_moisture,humidity, latitude, longitude, timestamp=None):
        self.id = id
        self.temperature = temperature
        self.soil_moisture = soil_moisture
        self.humidity = humidity
        self.latitude = latitude
        self.longitude = longitude
        # Si aucun timestamp n’est fourni, on prend l’heure actuelle
        self.timestamp = timestamp if timestamp else datetime.now()

        self.count+=1

    def __str__(self):
        return (f"SensorData(id={self.id}, temperature={self.temperature}°C, soil moisture={self.soil_moisture} "
                f"humidity={self.humidity}%, latitude={self.latitude}, "
                f"longitude={self.longitude}, timestamp={self.timestamp})")
    


sensors = []
fileName = "../Data/Data"

for i in range(24):
    fileNameUsed = f'{fileName}{i+1:02}.txt'
    with open(fileNameUsed, 'r') as file:
        data = json.load(file)
    print(data)
    sensors.append(sensor(
        id=data['id'],
        temperature=data['temperature'], 
        soil_moisture=data['soil_moisture'],
        humidity=data['humidity'],              
        latitude=data['latitude'],    
        longitude=data['longitude']
    ))


print(sensors)