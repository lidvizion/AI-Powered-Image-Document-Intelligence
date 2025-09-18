export const isLive = !!process.env.NEXT_PUBLIC_LV_API_URL;

export async function runJob(payload: FormData | object) {
  if (!isLive) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
    const res = await fetch("/mock/response.json", { cache: "no-store" });
    return res.json();
  }
  const url = `${process.env.NEXT_PUBLIC_LV_API_URL}/v1/run`;
  const headers: Record<string, string> = {
    "x-api-key": process.env.NEXT_PUBLIC_LV_API_KEY || "",
  };
  const body = payload instanceof FormData ? payload : JSON.stringify(payload);
  if (!(payload instanceof FormData)) headers["content-type"] = "application/json";
  const resp = await fetch(url, { method: "POST", headers, body });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

