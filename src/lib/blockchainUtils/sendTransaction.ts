import { type Hash } from "viem";

export async function sendTransaction(transaction: any): Promise<Hash> {
  try {
    const walletClient = await window.ethereum;

    if (!walletClient) throw new Error("Wallet not connected");

    // Send transaction
    const hash = await walletClient.sendTransaction(transaction);

    // Wait for transaction
    await walletClient.waitForTransactionReceipt({ hash });

    return hash;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}
