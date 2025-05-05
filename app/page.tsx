import PriceForecastTool from "@/components/price-forecast-tool"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Price Forecast & Negotiation Tool</h1>
        <p className="text-gray-600 mb-8">
          Get predicted wholesale prices for agricultural commodities to help with negotiation and planning.
        </p>
        <PriceForecastTool />
      </div>
    </main>
  )
}
