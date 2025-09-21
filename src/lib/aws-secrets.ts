interface APICredentials {
  newSatelliteAPI: { apiKey: string; baseUrl: string; farmId: string; maxArea: number; features: string[] };
  sentinelHub: { clientId: string; clientSecret: string; apiUrl: string };
  accuWeather: { apiKey: string; baseUrl: string };
  alchemy: { apiKey: string; network: string };
  infura: { projectId: string; projectSecret: string };
}

let cached: APICredentials | null = null;

export async function getAPICredentials(): Promise<APICredentials> {
  if (cached) return cached;
  cached = {
    newSatelliteAPI: {
      apiKey: process.env.EOS_API_KEY || "",
      baseUrl: "https://api-connect.eos.com/api",
      farmId: "2BH",
      maxArea: 300,
      features: ["natural_color", "vegetation_indices", "weather"],
    },
    sentinelHub: {
      clientId: process.env.SENTINEL_HUB_CLIENT_ID || "",
      clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET || "",
      apiUrl: "https://services.sentinel-hub.com",
    },
    accuWeather: {
      apiKey: process.env.ACCUWEATHER_API_KEY || "",
      baseUrl: "http://dataservice.accuweather.com",
    },
    alchemy: { apiKey: process.env.ALCHEMY_API_KEY || "", network: "mainnet" },
    infura: { projectId: process.env.INFURA_PROJECT_ID || "", projectSecret: process.env.INFURA_PROJECT_SECRET || "" },
  };
  return cached;
}

export async function getNewSatelliteAPICredentials() { return (await getAPICredentials()).newSatelliteAPI; }
export async function getSentinelHubCredentials() { return (await getAPICredentials()).sentinelHub; }
export async function getAccuWeatherCredentials() { return (await getAPICredentials()).accuWeather; }
export async function getBlockchainCredentials() {
  const c = await getAPICredentials(); return { alchemy: c.alchemy, infura: c.infura };
}
export function clearCredentialsCache() { cached = null; }
