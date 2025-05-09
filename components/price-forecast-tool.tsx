"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import ForecastResult from "./forecast-result"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"

// Data models
const PRODUCTS = [
  // { id: "rosecoco-beans", name: "Rosecoco Beans" },
  // { id: "pishori-rice", name: "Pishori Rice" },
  { id: "groundnuts", name: "Groundnuts Red" },
  // { id: "sorghum", name: "Sorghum" },
  // { id: "millet", name: "Millet" },
  { id: "green-grams", name: "Green Grams" },
]

// ADDED: Default price values by product
const PRODUCT_DEFAULT_PRICES = {
  groundnuts: {
    wholesale_price_lag1: 250,
    wholesale_price_lag2: 220,
    wholesale_price_rolling_avg: 243,
  },
  "green-grams": {
    wholesale_price_lag1: 125,
    wholesale_price_lag2: 125,
    wholesale_price_rolling_avg: 125,
  },
}

// // ADDED: Default fallback prices if product not found
const DEFAULT_PRICES = {
  wholesale_price_lag1: 100,
  wholesale_price_lag2: 95,
  wholesale_price_rolling_avg: 97.5,
}

const COUNTIES = [
  { id: "bungoma", name: "Bungoma" },
  // { id: "kisumu", name: "Kisumu" },
  // { id: "kakamega", name: "Kakamega" },
  // { id: "kiambu", name: "Kiambu" },
  // { id: "busia", name: "Busia" },
]

const MARKETS_BY_COUNTY = {
  bungoma: [
    { id: "bungoma-town", name: "Bungoma Town" },
    { id: "kimilili", name: "Kimilili" },
    { id: "webuye", name: "Webuye" },
    { id: "chwele", name: "Chwele" },
    { id: "kanduyi", name: "Kanduyi" },
  ],
  kisumu: [
    { id: "kisumu-city", name: "Kisumu City" },
    { id: "ahero", name: "Ahero" },
    { id: "muhoroni", name: "Muhoroni" },
    { id: "kondele", name: "Kondele" },
    { id: "kibuye", name: "Kibuye" },
  ],
  kakamega: [
    { id: "kakamega-town", name: "Kakamega Town" },
    { id: "mumias", name: "Mumias" },
    { id: "butere", name: "Butere" },
    { id: "malava", name: "Malava" },
    { id: "lurambi", name: "Lurambi" },
  ],
  kiambu: [
    { id: "kiambu-town", name: "Kiambu Town" },
    { id: "thika", name: "Thika" },
    { id: "kikuyu", name: "Kikuyu" },
    { id: "limuru", name: "Limuru" },
    { id: "ruiru", name: "Ruiru" },
  ],
  busia: [
    { id: "busia-town", name: "Busia Town" },
    { id: "malaba", name: "Malaba" },
    { id: "port-victoria", name: "Port Victoria" },
    { id: "bumala", name: "Bumala" },
    { id: "nambale", name: "Nambale" },
  ],
}

const ALL_MARKETS = Object.values(MARKETS_BY_COUNTY).flat()

// Form schema
const formSchema = z.object({
  market: z.string({ required_error: "Please select a market" }),
  county: z.string({ required_error: "Please select a county" }),
  product_name: z.string({ required_error: "Please select a product" }),
  month: z
    .number({ required_error: "Please select a month" })
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z
    .number({ required_error: "Please enter a year" })
    .min(2000, "Year must be after 2000")
    .max(2100, "Year must be before 2100"),
  wholesale_price_lag1: z.number().positive("Price must be positive").optional(),
  wholesale_price_lag2: z.number().positive("Price must be positive").optional(),
  wholesale_price_rolling_avg: z.number().positive("Price must be positive").optional(),
})

type FormValues = z.infer<typeof formSchema>

// Response type
type PredictionResponse = {
  predicted_monthly_wholesale_price: number
}

export default function PriceForecastTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastResult, setForecastResult] = useState<PredictionResponse | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [showPriceInfo, setShowPriceInfo] = useState(false)
  const [availableMarkets, setAvailableMarkets] = useState(ALL_MARKETS)
  // ADDED: State to track current default prices
  const [currentDefaultPrices, setCurrentDefaultPrices] = useState(DEFAULT_PRICES)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    resetField,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      market: "",
      county: "",
      product_name: "",
      month: new Date().getMonth() + 1, // Current month
      year: new Date().getFullYear(),
      wholesale_price_lag1: undefined, // Default value
      wholesale_price_lag2: undefined, // Default value
      wholesale_price_rolling_avg: undefined, // Default value
    },
  })

  // Watch the product_name field to update selectedProduct state
  const watchedProduct = watch("product_name")

  // ADDED: Effect to update default prices when product changes
  useEffect(() => {
    if (watchedProduct && watchedProduct !== selectedProduct) {
      setSelectedProduct(watchedProduct)

      // Get default prices for the selected product
      const productDefaults =
        PRODUCT_DEFAULT_PRICES[watchedProduct as keyof typeof PRODUCT_DEFAULT_PRICES] || DEFAULT_PRICES

      // Update the current default prices
      setCurrentDefaultPrices(productDefaults)

      // Update form values with the new defaults
      setValue("wholesale_price_lag1", productDefaults.wholesale_price_lag1)
      setValue("wholesale_price_lag2", productDefaults.wholesale_price_lag2)
      setValue("wholesale_price_rolling_avg", productDefaults.wholesale_price_rolling_avg)
    }
  }, [watchedProduct, selectedProduct, setValue])

  // Watch the county field to update available markets
  const selectedCounty = watch("county")

  // Effect to update markets when county changes
  useEffect(() => {
    if (selectedCounty) {
      // Update available markets based on selected county
      setAvailableMarkets(MARKETS_BY_COUNTY[selectedCounty as keyof typeof MARKETS_BY_COUNTY] || [])
      // Reset market selection when county changes
      resetField("market")
    } else {
      // If no county is selected, show all markets
      setAvailableMarkets(ALL_MARKETS)
    }
  }, [selectedCounty, resetField])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Submitting data:", data)

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch prediction")
      }

      const result = await response.json()
      setForecastResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div>
            <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
              Product *
            </label>
            <select
              id="product_name"
              {...register("product_name")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a product</option>
              {PRODUCTS.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.product_name && <p className="mt-1 text-sm text-red-600">{errors.product_name.message}</p>}
          </div>

          {/* County Selection */}
          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
              County *
            </label>
            <select
              id="county"
              {...register("county")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a county</option>
              {COUNTIES.map((county) => (
                <option key={county.id} value={county.id}>
                  {county.name}
                </option>
              ))}
            </select>
            {errors.county && <p className="mt-1 text-sm text-red-600">{errors.county.message}</p>}
          </div>

          {/* Market Selection */}
          <div>
            <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-1">
              Market *
            </label>
            <select
              id="market"
              {...register("market")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={!selectedCounty} // Disable if no county selected
            >
              <option value="">{selectedCounty ? "Select a market" : "Please select a county first"}</option>
              {availableMarkets.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.name}
                </option>
              ))}
            </select>
            {errors.market && <p className="mt-1 text-sm text-red-600">{errors.market.message}</p>}
          </div>

          {/* Target Month */}
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Target Month *
            </label>
            <Controller
              name="month"
              control={control}
              render={({ field }) => (
                <select
                  id="month"
                  value={field.value}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {format(new Date(2000, month - 1, 1), "MMMM")}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>}
          </div>

          {/* Target Year */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Target Year *
            </label>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  id="year"
                  value={field.value}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  min={2000}
                  max={2100}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              )}
            />
            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
          </div>
        </div>

        {/* ADDED: Display current default prices */}
        {selectedProduct && !showPriceInfo && (
          <div className="text-sm text-gray-500 mt-2">
            Using default prices for {PRODUCTS.find((p) => p.id === selectedProduct)?.name}: Most Recent:{" "}
            {currentDefaultPrices.wholesale_price_lag1} KES/Kg, Previous Month:{" "}
            {currentDefaultPrices.wholesale_price_lag2} KES/Kg, 3-Month Avg:{" "}
            {currentDefaultPrices.wholesale_price_rolling_avg} KES/Kg
          </div>
        )}

        {/* Toggle button for price information */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowPriceInfo(!showPriceInfo)}
            className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 focus:outline-none"
          >
            {showPriceInfo ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Advanced Price Information
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Advanced Price Information (Optional)
              </>
            )}
          </button>
        </div>

        {/* Conditionally render price information section */}
        {showPriceInfo && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Price Information (Optional)</h3>
            <p className="text-sm text-gray-500 mb-3">
              Default values for{" "}
              {selectedProduct ? PRODUCTS.find((p) => p.id === selectedProduct)?.name : "this product"} are pre-filled.
              You can adjust these values if you have more accurate recent price data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="wholesale_price_lag1" className="block text-sm font-medium text-gray-700 mb-1">
                  Most Recent Price (KES/Kg)
                </label>
                <Controller
                  name="wholesale_price_lag1"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      id="wholesale_price_lag1"
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      min={0.01}
                      step={0.01}
                      placeholder={`e.g., ${currentDefaultPrices.wholesale_price_lag1}`}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  )}
                />
                {errors.wholesale_price_lag1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.wholesale_price_lag1.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="wholesale_price_lag2" className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Month Price (KES/Kg)
                </label>
                <Controller
                  name="wholesale_price_lag2"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      id="wholesale_price_lag2"
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      min={0.01}
                      step={0.01}
                      placeholder={`e.g., ${currentDefaultPrices.wholesale_price_lag2}`}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  )}
                />
                {errors.wholesale_price_lag2 && (
                  <p className="mt-1 text-sm text-red-600">{errors.wholesale_price_lag2.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="wholesale_price_rolling_avg" className="block text-sm font-medium text-gray-700 mb-1">
                  3-Month Average Price (KES/Kg)
                </label>
                <Controller
                  name="wholesale_price_rolling_avg"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      id="wholesale_price_rolling_avg"
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)}
                      min={0.01}
                      step={0.01}
                      placeholder={`e.g., ${currentDefaultPrices.wholesale_price_rolling_avg}`}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  )}
                />
                {errors.wholesale_price_rolling_avg && (
                  <p className="mt-1 text-sm text-red-600">{errors.wholesale_price_rolling_avg.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Getting Forecast...
              </span>
            ) : (
              "Get Price Forecast"
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {forecastResult && !error && !isLoading && (
        <div className="mt-8">
          <ForecastResult
            result={forecastResult}
            productName={selectedProduct || ""}
            month={watch("month")}
            year={watch("year")}
            market={watch("market")}
          />
        </div>
      )}
    </div>
  )
}
