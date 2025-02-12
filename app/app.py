import os
import json
import uuid
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from uuid import uuid4
from datetime import datetime

app = Flask(__name__)
# CORS(app, resources={
#     r"/api/*": {
#         "origins": ["http://localhost:3000"],  # Your React app's URL
#         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#         "allow_headers": ["Content-Type"]
#     }
# })
CORS(app)

TRIPS_DIR = 'trips'
EXPENSES_FILE = 'expenses.json'
EXPENSES_DIR = 'expenses'
ITINERARIES_DIR = 'itineraries'

if not os.path.exists(TRIPS_DIR):
    os.makedirs(TRIPS_DIR)

if not os.path.exists(EXPENSES_DIR):
    os.makedirs(EXPENSES_DIR)

def read_expenses():
    """Read expenses from JSON file"""
    if not os.path.exists(EXPENSES_FILE):
        return []
    with open(EXPENSES_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def write_expenses(expenses):
    """Write expenses to JSON file"""
    with open(EXPENSES_FILE, 'w') as f:
        json.dump(expenses, f, indent=2)

def ensure_activity_id(activity):
    if not activity.get('id'):
        activity['id'] = str(uuid.uuid4())
    return activity

TRIP_NAME = 'Varkala_Trip'

def get_trip():
    """Always return the Varkala trip"""
    trip_path = os.path.join(TRIPS_DIR, f'{TRIP_NAME}.json')
    if not os.path.exists(trip_path):
        abort(404, description="Trip not found")
    with open(trip_path, 'r') as f:
        return json.load(f)
    
ITINERARIES_DIR = 'itineraries'

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/health')
def health_check():
    return 'Healthy', 200

@app.route('/api/itinerary', methods=['GET'])
def get_itinerary():
    itinerary_path = os.path.join(ITINERARIES_DIR, 'Varkala_Trip.json')
    if not os.path.exists(itinerary_path):
        return jsonify({"activities": [], "deletedActivities": []})
    
    with open(itinerary_path, 'r') as f:
        data = json.load(f)
    
    # Ensure all activities have an ID
    for activity in data.get('activities', []):
        if not activity.get('id'):
            activity['id'] = str(uuid.uuid4())
    
    return jsonify(data)

@app.route('/api/itinerary', methods=['POST'])
def update_itinerary():
    itinerary_path = os.path.join(ITINERARIES_DIR, 'Varkala_Trip.json')
    data = request.json

    data['activities'] = [ensure_activity_id(activity) for activity in data.get('activities', [])]
    data['deletedActivities'] = [ensure_activity_id(activity) for activity in data.get('deletedActivities', [])]
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(itinerary_path), exist_ok=True)
    
    with open(itinerary_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({"message": "Itinerary updated successfully"})

@app.route('/api/itinerary/addactivity', methods=['POST'])
def add_activity():
    itinerary_path = os.path.join(ITINERARIES_DIR, 'Varkala_Trip.json')
    activity = request.json
    
    # Load existing data
    if os.path.exists(itinerary_path):
        with open(itinerary_path, 'r') as f:
            data = json.load(f)
    else:
        data = {"activities": [], "deletedActivities": []}
    
    # Add new activity
    data['activities'].append(activity)
    
    # Save back to file
    with open(itinerary_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify(activity)

@app.route('/api/itinerary/activity/<string:activity_id>', methods=['PUT', 'OPTIONS'])
def update_activity(activity_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    itinerary_path = os.path.join(ITINERARIES_DIR, 'Varkala_Trip.json')
    
    # Log incoming data for debugging
    print(f"Attempting to update activity: {activity_id}")
    print(f"Request data: {request.json}")

    if not os.path.exists(itinerary_path):
        print(f"Itinerary file not found: {itinerary_path}")
        return jsonify({"error": "Itinerary not found"}), 404
        
    try:
        with open(itinerary_path, 'r') as f:
            data = json.load(f)

        # Print all existing activity IDs for debugging
        existing_ids = [activity.get('id') for activity in data.get('activities', [])]
        print(f"Existing activity IDs: {existing_ids}")

        activity_updated = False
        for activity in data['activities']:
            if activity.get('id') == activity_id:
                updated_data = request.json
                activity.update({
                    **updated_data,
                    'id': activity_id,
                    'lastModified': datetime.now().isoformat()
                })
                activity_updated = True
                break

        if not activity_updated:
            print(f"Activity with ID {activity_id} not found")
            return jsonify({"error": "Activity not found"}), 404

        with open(itinerary_path, 'w') as f:
            json.dump(data, f, indent=2)

        return jsonify({"message": "Activity updated successfully"})

    except Exception as e:
        print(f"Error updating activity: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/itinerary/activity/<activity_id>/comment', methods=['POST'])
def add_comment(activity_id):
    itinerary_path = os.path.join(ITINERARIES_DIR, 'Varkala_Trip.json')
    
    if not os.path.exists(itinerary_path):
        abort(404, description="Itinerary not found")
        
    comment_data = request.json
    
    with open(itinerary_path, 'r') as f:
        data = json.load(f)
    
    # Find the activity and add the comment
    for activity in data['activities']:
        if activity['id'] == activity_id:
            comment = {
                'id': str(uuid.uuid4()),
                'author': comment_data['author'],
                'text': comment_data['text'],
                'createdAt': datetime.now().isoformat(),
                'authorProfilePhoto': comment_data.get('authorProfilePhoto')
            }
            activity['comments'].append(comment)
            break
    else:
        abort(404, description="Activity not found")
    
    # Save the updated itinerary
    with open(itinerary_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify(comment)
    
@app.route('/api/trip', methods=['GET'])
def get_varkala_trip():
    trip_name = "Varkala_Trip"
    trip_path = os.path.join(TRIPS_DIR, f'{trip_name}.json')
    if not os.path.exists(trip_path):
        abort(404, description="Trip not found")
    with open(trip_path, 'r') as f:
        trip = json.load(f)
    return jsonify(trip)

@app.route('/api/trips/expenses', methods=['GET', 'POST'])
def trip_expenses():
    trip_name = "Varkala_Trip"
    trip = get_trip()
    if not trip:
        abort(404, description="Trip not found")
    
    # Get all members including createdByUsername
    members = [m['name'] for m in trip['members']]
    if trip['createdByUsername'] not in members:
        members.append(trip['createdByUsername'])
    
    expenses_path = os.path.join(EXPENSES_DIR, f'{TRIP_NAME}.json')
    
    if request.method == 'GET':
        if not os.path.exists(expenses_path):
            return jsonify([])
        with open(expenses_path, 'r') as f:
            return jsonify(json.load(f))
            
    elif request.method == 'POST':
        new_expense = request.get_json()
        required_fields = ['category', 'description', 'amount', 'paidBy', 'splitBetween', 'splitType']
        if not all(field in new_expense for field in required_fields):
            abort(400, description="Missing required fields")
        
        # Handle split type
        if new_expense['splitType'] == 'all':
            new_expense['splitBetween'] = members
        
        # Validate members
        if new_expense['paidBy'] not in members:
            abort(400, description="Payer must be a trip member")
        if not all(member in members for member in new_expense['splitBetween']):
            abort(400, description="All split members must be trip members")
        
        # Create expense
        new_expense['id'] = str(uuid4())
        new_expense['isSettled'] = False
        
        # Read existing expenses or initialize empty list
        expenses = []
        if os.path.exists(expenses_path):
            with open(expenses_path, 'r') as f:
                try:
                    expenses = json.load(f)
                except json.JSONDecodeError:
                    expenses = []
        
        expenses.append(new_expense)
        
        # Ensure directory exists before writing
        os.makedirs(os.path.dirname(expenses_path), exist_ok=True)
        
        with open(expenses_path, 'w') as f:
            json.dump(expenses, f, indent=2)
            
        return jsonify(new_expense), 201

@app.route('/api/trips/expenses/delete', methods=['POST'])
def delete_expense():
    try:
        expense_data = request.get_json()
        required_fields = ['description', 'paidBy', 'amount']
        if not all(field in expense_data for field in required_fields):
            abort(400, description="Missing required fields")

        expenses_path = os.path.join(EXPENSES_DIR, f'{TRIP_NAME}.json')
        
        if not os.path.exists(expenses_path):
            abort(404, description="Expenses file not found")

        # Read existing expenses
        with open(expenses_path, 'r') as f:
            expenses = json.load(f)

        # Find and remove the matching expense
        expenses = [expense for expense in expenses 
                   if not (expense['description'] == expense_data['description'] and
                          expense['paidBy'] == expense_data['paidBy'] and
                          expense['amount'] == expense_data['amount'])]

        # Write back to file
        with open(expenses_path, 'w') as f:
            json.dump(expenses, f, indent=2)

        return jsonify({"message": "Expense deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/trips/expenses/settle', methods=['POST'])
def settle_expense():
    try:
        expense_data = request.get_json()
        required_fields = ['description', 'paidBy', 'amount']
        if not all(field in expense_data for field in required_fields):
            abort(400, description="Missing required fields")

        expenses_path = os.path.join(EXPENSES_DIR, f'{TRIP_NAME}.json')
        
        if not os.path.exists(expenses_path):
            abort(404, description="Expenses file not found")

        # Read existing expenses
        with open(expenses_path, 'r') as f:
            expenses = json.load(f)

        # Find and update the matching expense
        updated = False
        for expense in expenses:
            if (expense['description'] == expense_data['description'] and
                expense['paidBy'] == expense_data['paidBy'] and
                expense['amount'] == expense_data['amount']):
                expense['isSettled'] = True
                updated = True
                break

        if not updated:
            abort(404, description="Expense not found")

        # Write back to file
        with open(expenses_path, 'w') as f:
            json.dump(expenses, f, indent=2)

        return jsonify({"message": "Expense marked as settled"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trips', methods=['GET'])
def get_trips():
    username = request.args.get('username').lower()
    print(f"Received GET request for username: {username}")
    
    if not username or username == 'undefined':
        return jsonify({"error": "Username is required"}), 400
    
    trips = []
    
    for filename in os.listdir(TRIPS_DIR):
        if filename.endswith('.json'):
            with open(os.path.join(TRIPS_DIR, filename), 'r') as f:
                trip = json.load(f)
                print(f"Checking trip: {trip}")
                if ('createdByUsername' in trip and trip['createdByUsername'].lower() == username) or \
                   any(m['name'].lower() == username.lower() for m in trip.get('members', [])):
                    trips.append(trip)
    
    return jsonify(trips)

@app.route('/api/trips', methods=['POST'])
def create_trip():
    print("Received POST request to /api/trips")
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    trip_data = request.json
    print("Received trip data:", trip_data)

    for member in trip_data.get('members', []):
        if 'avatar' not in member:
            member['avatar'] = '/curious_cat.png'
    
    if not trip_data:
        return jsonify({"error": "No data provided"}), 400
    
    if 'createdByUsername' not in trip_data:
        return jsonify({"error": "createdByUsername is required"}), 400
    
    trip_id = str(uuid.uuid4())
    trip_data['id'] = trip_id
    trip_name = "Varkala_Trip"
    
    try:
        file_path = os.path.join(TRIPS_DIR, f'{trip_name}.json')
        with open(file_path, 'w') as f:
            json.dump(trip_data, f)
        print(f"Trip created successfully with ID & NAME: {trip_id} & {trip_name}")
        return jsonify({"id": trip_id}), 201
    except Exception as e:
        print(f"Error creating trip: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/trips/<trip_id>', methods=['PUT'])
def update_trip(trip_id):
    trip_name = "Varkala_Trip"
    username = request.args.get('username')
    if not username or username == 'undefined':
        return jsonify({"error": "Username is required"}), 400

    file_path = os.path.join(TRIPS_DIR, f'{trip_name}.json')
    if not os.path.exists(file_path):
        return jsonify({"error": "Trip not found"}), 404
    
    # Load existing trip
    with open(file_path, 'r') as f:
        existing_trip = json.load(f)
    
    # Check if user has permission to edit
    username = username.lower()
    if not (existing_trip.get('createdByUsername', '').lower() == username or
            any(m['name'].lower() == username for m in existing_trip.get('members', []))):
        return jsonify({"error": "You don't have permission to edit this trip"}), 403
    
    # Update trip data while preserving creator information
    trip_data = request.json
    trip_data['createdByUsername'] = existing_trip['createdByUsername']  # Preserve original creator
    trip_data['id'] = trip_id  # Ensure ID remains the same
    
    try:
        with open(file_path, 'w') as f:
            json.dump(trip_data, f)
        return jsonify({"message": "Trip updated successfully"})
    except Exception as e:
        return jsonify({"error": f"Failed to update trip: {str(e)}"}), 500

@app.route('/api/trips/<trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    trip_name = "Varkala_Trip"
    file_path = os.path.join(TRIPS_DIR, f'{trip_name}.json')
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({"message": "Trip deleted successfully"})
    return jsonify({"error": "Trip not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)