import { type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      status: "ok",
      serverTime: new Date().toISOString(),
    }),
    {
      status: 200,
    }
  );
}
