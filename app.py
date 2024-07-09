from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})

@app.route('/location', methods=['POST'])
def location():
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')
    name = data.get('name')
    # Process the location data here
    print(f"Received location: {name} (Lat: {lat}, Lon: {lon})")
    return jsonify({'status': 'success', 'data': data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
