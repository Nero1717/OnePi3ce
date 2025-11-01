import json


data = [
  {"id":"S001","temperature":28.4,"humidity":56,"latitude":36.8219,"longitude":10.3238,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S002","temperature":30.1,"humidity":48,"latitude":36.8254,"longitude":10.3291,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S003","temperature":26.7,"humidity":61,"latitude":36.8235,"longitude":10.3277,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S004","temperature":29.5,"humidity":52,"latitude":36.8223,"longitude":10.3259,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S005","temperature":31.0,"humidity":45,"latitude":36.8248,"longitude":10.3222,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S006","temperature":27.3,"humidity":59,"latitude":36.8261,"longitude":10.3264,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S007","temperature":25.8,"humidity":63,"latitude":36.8209,"longitude":10.3243,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S008","temperature":32.2,"humidity":41,"latitude":36.8272,"longitude":10.3215,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S009","temperature":28.9,"humidity":55,"latitude":36.8229,"longitude":10.3282,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S010","temperature":29.8,"humidity":50,"latitude":36.8238,"longitude":10.3269,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S011","temperature":27.6,"humidity":58,"latitude":36.8242,"longitude":10.3208,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S012","temperature":30.4,"humidity":47,"latitude":36.8265,"longitude":10.3231,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S013","temperature":31.8,"humidity":44,"latitude":36.8279,"longitude":10.3294,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S014","temperature":29.1,"humidity":53,"latitude":36.8204,"longitude":10.3226,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S015","temperature":26.4,"humidity":62,"latitude":36.8211,"longitude":10.3289,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S016","temperature":28.2,"humidity":57,"latitude":36.8232,"longitude":10.3245,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S017","temperature":30.9,"humidity":46,"latitude":36.8268,"longitude":10.3272,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S018","temperature":27.1,"humidity":60,"latitude":36.8249,"longitude":10.3219,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S019","temperature":32.5,"humidity":40,"latitude":36.8287,"longitude":10.3257,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S020","temperature":29.3,"humidity":52,"latitude":36.8228,"longitude":10.3275,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S021","temperature":28.7,"humidity":54,"latitude":36.8250,"longitude":10.3240,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S022","temperature":30.0,"humidity":49,"latitude":36.8263,"longitude":10.3285,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S023","temperature":27.8,"humidity":57,"latitude":36.8237,"longitude":10.3251,"timestamp":"2025-11-01T07:15:00Z"},
  {"id":"S024","temperature":31.2,"humidity":43,"latitude":36.8275,"longitude":10.3228,"timestamp":"2025-11-01T07:15:00Z"}
]


fileName = "Data"

for i in range(24):
    fileNameUsed = f'{fileName}{i+1:02}.txt'

    with open(fileNameUsed, 'w') as file:
        json.dump(data[i], file, indent=4)

    