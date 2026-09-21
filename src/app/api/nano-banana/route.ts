import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-app-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type GenerateBody = {
  prompt?: string;
  aspectRatio?: string;
  format?: "json" | "png";
  imageBase64?: string;
  mimeType?: string;
};

type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  // Key resolution: per-request header wins, env fallback. With no env key set,
  // callers must bring their own key, so the endpoint can't burn our quota.
  const apiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "no Gemini key: send x-gemini-key header or set GEMINI_API_KEY" },
      { status: 401, headers: CORS }
    );
  }
  if (process.env.NANO_APP_KEY && req.headers.get("x-app-key") !== process.env.NANO_APP_KEY) {
    return NextResponse.json({ error: "invalid x-app-key" }, { status: 401, headers: CORS });
  }

  let body: GenerateBody | null = null;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    body = null;
  }
  const prompt = body?.prompt;
  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400, headers: CORS });
  }
  const aspectRatio = body?.aspectRatio || "1:1";
  const format = body?.format || "json";

  const parts: GeminiPart[] = [{ text: prompt }];
  if (body?.imageBase64) {
    parts.push({ inlineData: { mimeType: body.mimeType || "image/png", data: body.imageBase64 } });
  }

  const upstream = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { imageConfig: { aspectRatio } },
    }),
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "gemini error" },
      { status: upstream.status, headers: CORS }
    );
  }

  const candidateParts: GeminiPart[] = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = candidateParts.find((p) => p.inlineData);
  if (!imgPart || !imgPart.inlineData) {
    const text = candidateParts.map((p) => p.text).filter(Boolean).join("\n");
    return NextResponse.json(
      { error: "no image returned", detail: text || data?.promptFeedback || null },
      { status: 502, headers: CORS }
    );
  }

  if (format === "png") {
    return new Response(Buffer.from(imgPart.inlineData.data, "base64"), {
      status: 200,
      headers: { ...CORS, "content-type": imgPart.inlineData.mimeType || "image/png" },
    });
  }
  return NextResponse.json(
    { mimeType: imgPart.inlineData.mimeType, imageBase64: imgPart.inlineData.data },
    { headers: CORS }
  );
}
