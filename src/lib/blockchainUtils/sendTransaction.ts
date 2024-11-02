import { type Hash } from "viem";

export async function sendTransaction(transaction: any): Promise<Hash> {
  try {
    const walletClient = await window.ethereum;

    if (!walletClient) throw new Error("Wallet not connected");

    console.log("Sending transaction:", transaction);
    // Send transaction
    const hash = await walletClient.sendTransaction(transaction);

    console.log("Transaction sent:", hash);
    // Wait for transaction
    const receipt = await walletClient.waitForTransactionReceipt({ hash });

    console.log("Transaction receipt:", receipt);

    return hash;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}
