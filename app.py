from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})

API_KEY = os.getenv('API_KEY')

def geocode_location(location):
    geocode_url = f'https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={API_KEY}'
    geocode_response = requests.get(geocode_url).json()
    if not geocode_response['results']:
        return None
    return geocode_response['results'][0]['geometry']['location']

def get_places(lat, lng, place_type, keywords):
    keyword_query = '|'.join(keywords)
    places_url = f'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius=1500&type={place_type}&keyword={keyword_query}&key={API_KEY}'
    return requests.get(places_url).json()

def get_place_details(place_id):
    place_details_url = f'https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,formatted_address,photo,rating,opening_hours,website&key={API_KEY}'
    return requests.get(place_details_url).json()


def get_photo_url(photo_reference):
    return f'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={API_KEY}'

@app.route('/restaurants', methods=['POST'])
def get_restaurants():
    data = request.get_json()
    location = data.get('location')
    food_types = data.get('foodTypes', [])

    if not location:
        return jsonify({'error': 'Location is required'}), 400

    lat_lng = geocode_location(location)
    if not lat_lng:
        return jsonify({'error': 'Location not found'}), 404

    places_response = get_places(lat_lng['lat'], lat_lng['lng'], 'restaurant', food_types)
    if 'results' not in places_response or not places_response['results']:
        return jsonify({'error': 'No restaurants found'}), 404

    restaurants = []
    response = sorted(places_response['results'], key=lambda x: x['rating'], reverse=True)

    for place in response[:10]:
        place_rating = place['rating']
        place_open = place['opening_hours']['open_now']
        place_id = place['place_id']
        
        place_details_response = get_place_details(place_id)

        if 'result' in place_details_response:
            result = place_details_response['result']
            restaurant = {
                'name': result.get('name'),
                'address': result.get('formatted_address'),
                'photo_url': get_photo_url(result['photos'][0]['photo_reference']) if 'photos' in result else None,
                'open': "Yes" if place_open else "No",
                'rating': place_rating,
                'website': result.get('website')  # Include website if available
            }
            restaurants.append(restaurant)

    return jsonify({'restaurants': restaurants})


@app.route('/activities', methods=['POST'])
def get_activities():
    data = request.get_json()
    location = data.get('location')
    activity_types = data.get('activityTypes', [])

    if not location:
        return jsonify({'error': 'Location is required'}), 400

    lat_lng = geocode_location(location)
    if not lat_lng:
        return jsonify({'error': 'Location not found'}), 404

    places_response = get_places(lat_lng['lat'], lat_lng['lng'], 'point_of_interest', activity_types)
    if 'results' not in places_response or not places_response['results']:
        return jsonify({'error': 'No activities found'}), 404

    activities = []
    for place in places_response['results']: 
        place_details_response = get_place_details(place['place_id'])
        if 'result' in place_details_response:
            result = place_details_response['result']
            activity = {
                'name': result.get('name'),
                'address': result.get('formatted_address'),
                'photo_url': get_photo_url(result['photos'][0]['photo_reference']) if 'photos' in result else None,
                'rating': result.get('rating'),
                'open': "Yes" if result.get('opening_hours', {}).get('open_now') else "No"
            }
            activities.append(activity)

    return jsonify({'activities': activities})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
