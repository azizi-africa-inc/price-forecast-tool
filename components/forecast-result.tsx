"use client"

import { format } from "date-fns"

type ForecastResultProps = {
  result: {
    predicted_monthly_wholesale_price: number
  }
  productName: string
  month: number
  year: number
  market: string
}

// Helper function to get product name from ID
const getProductName = (id: string): string => {
  const productMap: Record<string, string> = {
    "rosecoco-beans": "Rosecoco Beans",
    "pishori-rice": "Rice",
    groundnuts: "Groundnuts Red",
    "green-grams": "Green Grams",
    sorghum: "Sorghum",
    millet: "Millet",
  }

  return productMap[id] || id
}

// CHANGED: Updated market names to match the new markets
const getMarketName = (id: string): string => {
  const marketMap: Record<string, string> = {
    // Bungoma markets
    "bungoma-town": "Bungoma Town",
    kimilili: "Kimilili",
    webuye: "Webuye",
    chwele: "Chwele",
    kanduyi: "Kanduyi",

    // Kisumu markets
    "kisumu-city": "Kisumu City",
    ahero: "Ahero",
    muhoroni: "Muhoroni",
    kondele: "Kondele",
    kibuye: "Kibuye",

    // Kakamega markets
    "kakamega-town": "Kakamega Town",
    mumias: "Mumias",
    butere: "Butere",
    malava: "Malava",
    lurambi: "Lurambi",

    // Kiambu markets
    "kiambu-town": "Kiambu Town",
    thika: "Thika",
    kikuyu: "Kikuyu",
    limuru: "Limuru",
    ruiru: "Ruiru",

    // Busia markets
    "busia-town": "Busia Town",
    malaba: "Malaba",
    "port-victoria": "Port Victoria",
    bumala: "Bumala",
    nambale: "Nambale",
  }

  return marketMap[id] || id
}

export default function ForecastResult({ result, productName, month, year, market }: ForecastResultProps) {
  const displayProductName = getProductName(productName)
  const displayMarketName = getMarketName(market)
  const monthName = format(new Date(2000, month - 1, 1), "MMMM")

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-green-800 mb-4">Forecast Results</h2>

      <div className="mb-6">
        <p className="text-lg text-gray-700">
          Predicted Wholesale Price for <span className="font-semibold">{displayProductName}</span> in{" "}
          {displayMarketName} around {monthName}, {year}:
        </p>
        <p className="text-3xl font-bold text-green-700 mt-2">
          {result.predicted_monthly_wholesale_price.toFixed(2)} KES/Kg
        </p>
      </div>

      <div className="bg-white p-4 rounded-md border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-2">How to use this forecast:</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Use this price as a benchmark when negotiating with suppliers</li>
          <li>Plan your budget accordingly for future raw material costs</li>
          <li>Compare with current spot prices to identify potential savings</li>
          <li>Consider market trends and seasonal variations in your planning</li>
        </ul>
      </div>
    </div>
  )
}
