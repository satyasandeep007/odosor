import axios from "axios";

export const getPrice = async (tokenAddress: string) => {
  const response = await axios.post(
    process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || "",
    {
      method: "odos_tokenPrices",
      params: [{ tokenAddrs: [tokenAddress] }],
      id: 1,
      jsonrpc: "2.0",
    }
  );
  return response.data.result[tokenAddress];
};
