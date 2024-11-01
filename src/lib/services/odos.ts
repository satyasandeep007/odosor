import axios, { AxiosInstance } from "axios";

// Types
interface TokenPrice {
  address: string;
  chainId: number;
  price: number;
  // Add other fields as needed
}

interface QuoteRequest {
  chainId: number;
  compact: boolean;
  gasPrice: number;
  inputTokens: {
    amount: string;
    tokenAddress: string;
  }[];
  outputTokens: {
    proportion: number;
    tokenAddress: string;
  }[];
  referralCode: number;
  slippageLimitPercent: number;
  sourceBlacklist: string[];
  sourceWhitelist: string[];
  userAddr: string;
}

// Add these interfaces above the class
interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  assetId: string;
  assetType: string;
  protocolId: string | null;
  isRebasing: boolean;
}

interface TokenResponse {
  tokenMap: {
    [address: string]: TokenInfo;
  };
}

interface AssembleRequest {
  userAddr: string; // Checksummed ethereum address
  pathId: string; // Path ID received from quote response
  simulate?: boolean; // Optional flag for gas estimation simulation
  gasPrice?: number; // Optional gas price in gwei
  slippageLimitPercent?: number; // Optional slippage limit
  referralCode?: number; // Optional referral code
}

export class OdosService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "https://api.odos.xyz",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response) {
          // Server responded with error status
          throw new Error(
            `API Error: ${error.response.status} - ${
              error.response.data?.message || "Unknown error"
            }`
          );
        } else if (error.request) {
          // Request made but no response
          throw new Error("No response from server");
        } else {
          // Request setup error
          throw new Error(`Request failed: ${error.message}`);
        }
      }
    );
  }

  // Get all supported currencies
  async getCurrencies() {
    try {
      const response = await this.api.get("/pricing/currencies");
      return response;
    } catch (error) {
      throw this.handleError("Failed to get currencies", error);
    }
  }

  // Get price for a specific token
  async getTokenPrice(
    chainId: number,
    tokenAddress: string
  ): Promise<TokenPrice> {
    try {
      const response = await this.api.get(
        `/pricing/token/${chainId}/${tokenAddress}`
      );
      return response;
    } catch (error) {
      throw this.handleError("Failed to get token price", error);
    }
  }

  // Get prices for multiple tokens
  async getTokenPrices(
    chainId: number,
    tokenAddresses: string[]
  ): Promise<TokenPrice[]> {
    try {
      const addresses = tokenAddresses.join(",");
      const response = await this.api.get(`/pricing/token/${chainId}`, {
        params: { token_addresses: addresses },
      });
      return response;
    } catch (error) {
      throw this.handleError("Failed to get token prices", error);
    }
  }

  // Get supported chains
  async getChains() {
    try {
      const response = await this.api.get("/info/chains");
      console.log(response, "response.data");
      return response?.chains || [];
    } catch (error) {
      throw this.handleError("Failed to get chains", error);
    }
  }

  // Get contract info for a chain
  async getContractInfo(chainId: number) {
    try {
      const response = await this.api.get(`/info/contract-info/v2/${chainId}`);
      return response;
    } catch (error) {
      throw this.handleError("Failed to get contract info", error);
    }
  }

  async getChainTokens(chainId: number) {
    try {
      const response = await this.api.get<TokenResponse>(
        `/info/tokens/${chainId}`
      );
      const tokenMap = response?.tokenMap || {};
      return Object.entries(tokenMap).map(([address, token]) => ({
        address,
        ...(token as TokenInfo),
      }));
    } catch (error) {
      throw this.handleError("Failed to get chain tokens", error);
    }
  }

  // Get liquidity sources for a chain
  async getLiquiditySources(chainId: number) {
    try {
      const response = await this.api.get(`/info/liquidity-sources/${chainId}`);
      return response;
    } catch (error) {
      throw this.handleError("Failed to get liquidity sources", error);
    }
  }

  // Get quote for a swap
  async getQuote(request: QuoteRequest) {
    try {
      const response = await this.api.post("/sor/quote/v2", request);
      console.log(response, "response.data");
      return response;
    } catch (error) {
      throw this.handleError("Failed to get quote", error);
    }
  }

  // Helper method for consistent error handling
  private handleError(message: string, error: any): never {
    console.error(`${message}:`, error);
    if (error instanceof Error) {
      throw new Error(`${message}: ${error.message}`);
    }
    throw new Error(message);
  }

  async assembleTransaction(assembleRequestBody: AssembleRequest) {
    try {
      const response = await this.api.post(
        "/sor/assemble",
        assembleRequestBody
      );
      return response;
    } catch (error) {
      throw this.handleError("Failed to assemble transaction", error);
    }
  }
}
