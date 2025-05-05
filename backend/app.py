from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)

# Load the pickled model
MODEL_PATH = '/home/zakia-mustafa/Desktop/price-forecast-tool/backend/monthly_price_prediction_model2.pkl'  # Replace with the actual path

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/api/forecast', methods=['POST'])
def forecast():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    data = request.json
    
    try:
        # Extract parameters from request
        commodity = data.get('commodity')
        market = data.get('market', 'bungoma-town')
        target_month = int(data.get('target_month'))
        target_year = int(data.get('target_year'))
        price_lag1 = data.get('price_lag1')
        price_rolling_avg = data.get('price_rolling_avg')
        
        # Validate inputs
        if not commodity or not target_month or not target_year:
            return jsonify({"error": "Missing required parameters"}), 400
        
        if target_month < 1 or target_month > 12:
            return jsonify({"error": "Month must be between 1 and 12"}), 400
            
        current_year = datetime.now().year
        if target_year < current_year or target_year > current_year + 5:
            return jsonify({"error": f"Year must be between {current_year} and {current_year + 5}"}), 400
        
        # Prepare input for model
        # Note: Adjust this based on your model's expected input format
        input_data = {
            'commodity': commodity,
            'market': market,
            'month': target_month,
            'year': target_year
        }
        
        if price_lag1 is not None:
            input_data['price_lag1'] = float(price_lag1)
        
        if price_rolling_avg is not None:
            input_data['price_rolling_avg'] = float(price_rolling_avg)
        
        # Convert to DataFrame or whatever format your model expects
        # This is a placeholder - adjust based on your model's requirements
        input_df = pd.DataFrame([input_data])
        
        # Make prediction
        prediction = model.predict(input_df)[0]

        import pdb; pdb.set_trace()
        # Return result
        return jsonify({
            "predicted_monthly_wholesale_price": float(prediction),
            "commodity": commodity,
            "market": market,
            "target_month": target_month,
            "target_year": target_year,
            "confidence_level": 0.85  # Placeholder - replace with actual confidence if available
        })
        
    except Exception as e:
        print(f"Error making prediction: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
