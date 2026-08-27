import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not defined in environment variables."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          marketTrend: {
            type: SchemaType.STRING,
            enum: ["Increasing", "Stable", "Decreasing"],
          },
          riskLevel: {
            type: SchemaType.STRING,
            enum: ["Low", "Medium", "High"],
          },
          estimatedRate: { type: SchemaType.NUMBER },
          rateUnit: { type: SchemaType.STRING },
          charterAdvice: { type: SchemaType.STRING },
          reasoning: { type: SchemaType.STRING },
          keyFactors: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          rateData: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                month: { type: SchemaType.STRING },
                historicalRate: { type: SchemaType.NUMBER, nullable: true },
                projectedRate: { type: SchemaType.NUMBER },
              },
              required: ["month", "projectedRate"],
            },
          },
        },
        required: [
          "marketTrend",
          "riskLevel",
          "estimatedRate",
          "rateUnit",
          "charterAdvice",
          "reasoning",
          "keyFactors",
          "rateData",
        ],
      },
    },
  });
};

export const generateForecast = async ({
  origin,
  destination,
  vesselType,
  cargoQuantity,
  forecastPeriod,
  compatiblePorts = [],
  restrictedPorts = [],
}) => {
  const model = getModel();

  const compatibleNames = compatiblePorts.map((p) => p.name).join(", ");
  const restrictedNames = restrictedPorts.map((p) => p.name).join(", ");

  const prompt = `
You are an expert maritime freight procurement analyst.

Analyze the following bulk cargo chartering scenario:
- Origin: ${origin}
- Destination: ${destination}
- Vessel Type: ${vesselType}
- Cargo Quantity: ${cargoQuantity} MT
- Forecast Period: ${forecastPeriod}
- Compatible East Coast Ports: ${compatibleNames || "None"}
- Restricted East Coast Ports: ${restrictedNames || "None"}

Provide a practical chartering recommendation.

IMPORTANT:
- Do not claim to have access to live freight market prices.
- Do not invent real historical market data.
- Treat rate values as indicative estimates only.
- Focus on reasoning, risk, vessel suitability, and charter timing.
- Generate exactly 6 monthly points for rateData.
- Use null for historicalRate where appropriate.
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error generating forecast in geminiService:", error);
    throw error;
  }
};

const getExplanationModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-3.6-flash" });
};

export const generateForecastExplanation = async ({ input, modelForecast }) => {
  const model = getExplanationModel();
  const prompt = `Explain this bulk freight forecast in simple everyday business language for a logistics manager. Avoid technical terms, model names, statistics, and programming language. Do not change or invent any numbers. Give a short recommendation, a short reason, and one practical next step. Use one short paragraph only.
Route: ${input.origin} to ${input.destination}; vessel: ${input.vesselType}; cargo: ${input.cargoQuantity} MT; period: ${input.forecastPeriod}
Forecast model: ${JSON.stringify(modelForecast)}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};