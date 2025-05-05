from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, conint, confloat, Field
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware
import joblib
from mangum import Mangum  # Add this for serverless compatibility
from typing import Optional

# Define the input data model
class PricePredictionRequest(BaseModel):
    market: str = Field(..., description="The market where the product is sold.")
    county: str
    product_name: str
    month: conint(ge=1, le=12)          # Ensure month is between 1 and 12
    year: conint(ge=2000, le=2100)      # Ensure year is reasonable
    wholesale_price_lag1: Optional[float] = None  # Optional field
    wholesale_price_lag2: Optional[float] = None  # Optional field
    wholesale_price_rolling_avg: Optional[float] = None  # Optional field

# Initialize FastAPI app
app = FastAPI()

# Configure CORS using CORSMiddleware
origins = [
    "http://localhost:3000",  # Replace with your frontend's origin
    "http://localhost", # Add this line
    "https://your-frontend-domain.com",  # Add your production frontend domain
    "*", # allow all origins
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model (ensure the model file exists)
try:
    model = joblib.load("monthly_price_prediction_model2.pkl")
except Exception as e:
    raise RuntimeError(f"Failed to load the model: {e}")

@app.post("/predict")
def predict(request: PricePredictionRequest):
    try:
        # Convert the request data into a DataFrame
        input_data = request.dict()
        df = pd.DataFrame([input_data])

        # Make a prediction
        prediction = model.predict(df)

        # Return the predicted price
        return {"predicted_monthly_wholesale_price": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")

# Add Mangum handler for serverless deployment
handler = Mangum(app)