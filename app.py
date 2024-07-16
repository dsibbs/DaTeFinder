from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})

API_KEY = str(os.getenv('API_KEY'))

@app.route('/restaurants', methods=['POST'])
def get_restaurants():
    data = request.get_json()
    location = data.get('location')
    food_types = data.get('foodTypes', [])

    if not location:
        return jsonify({'error': 'Location is required'}), 400

    # Geocode the location to get latitude and longitude
    geocode_url = f'https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={API_KEY}'
    geocode_response = requests.get(geocode_url).json()

    if not geocode_response['results']:
        return jsonify({'error': 'Location not found'}), 404

    lat_lng = geocode_response['results'][0]['geometry']['location']
    lat = lat_lng['lat']
    lng = lat_lng['lng']

    keyword_query = '|'.join(food_types)
    places_url = f'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=1500&type=restaurant&keyword={keyword_query}&key={API_KEY}'
    places_response = requests.get(places_url).json()

    if 'results' not in places_response or not places_response['results']:
        return jsonify({'error': 'No restaurants found'}), 404

    restaurants = []
    print("places_response is: ", places_response)
    for place in places_response['results'][:5]:# Get the top 5 results
        # Get details including photos for each place
        print("place is: ", place)
        place_rating = place['rating']
        place_open = place['opening_hours']['open_now']
        place_id = place['place_id']
        place_details_url = f'https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,formatted_address,photo&key={API_KEY}'
        place_details_response = requests.get(place_details_url).json()
        print("place_deatails_ response is: ", place_details_response)

        if 'result' in place_details_response:
            restaurant = {
                'name': place_details_response['result']['name'],
                'address': place_details_response['result']['formatted_address'],
                'photo_url': get_photo_url(place_details_response['result']['photos'][0]['photo_reference']) if 'photos' in place_details_response['result'] else None,
                'rating': place_rating,
                'open': "Yes" if place_open else "No"
            }
            restaurants.append(restaurant)

    return jsonify({'restaurants': restaurants})

def get_photo_url(photo_reference):
    return f'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={API_KEY}'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
