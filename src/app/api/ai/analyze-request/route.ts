
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const MODEL = process.env.AI_MODEL || "gpt-5.6-luna";

const openai = process.env.AI_API_KEY
  ? new OpenAI({
      apiKey: process.env.AI_API_KEY,
    })
  : null;

type AIAnalysis = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  reason: string;
  confidence: number;
};

function fallbackAnalysis(
  serviceName: string,
  title: string,
  description: string,
): AIAnalysis {
  const text = `${serviceName} ${title} ${description}`.toLowerCase();

  const highKeywords = [
    "fire",
    "smoke",
    "burning",
    "shock",
    "electric shock",
    "sparking",
    "short circuit",
    "electrical danger",
    "gas leak",
    "leakage",
    "flood",
    "emergency",
    "severe pain",
    "unconscious",
    "accident",
    "danger",
    "security breach",
    "break in",
    "urgent",
  ];

  const mediumKeywords = [
    "not working",
    "broken",
    "damage",
    "leak",
    "problem",
    "failure",
    "repair",
    "blocked",
    "clogged",
    "water issue",
    "power issue",
    "malfunction",
  ];

  const hasHighSignal = highKeywords.some((keyword) =>
    text.includes(keyword),
  );

  const hasMediumSignal = mediumKeywords.some((keyword) =>
    text.includes(keyword),
  );

  let priority: AIAnalysis["priority"] = "LOW";

  if (hasHighSignal) {
    priority = "HIGH";
  } else if (hasMediumSignal) {
    priority = "MEDIUM";
  }

  let category = serviceName || "General Services";

  if (
    text.includes("electric") ||
    text.includes("wiring") ||
    text.includes("switch") ||
    text.includes("socket") ||
    text.includes("power") ||
    text.includes("voltage")
  ) {
    category = "Electrical Repair";
  } else if (
    text.includes("plumb") ||
    text.includes("pipe") ||
    text.includes("tap") ||
    text.includes("water") ||
    text.includes("drain") ||
    text.includes("toilet") ||
    text.includes("leak")
  ) {
    category = "Plumbing";
  } else if (
    text.includes("doctor") ||
    text.includes("medical") ||
    text.includes("medicine") ||
    text.includes("health") ||
    text.includes("pain") ||
    text.includes("fever")
  ) {
    category = "Healthcare";
  } else if (
    text.includes("farm") ||
    text.includes("crop") ||
    text.includes("agriculture") ||
    text.includes("irrigation") ||
    text.includes("tractor")
  ) {
    category = "Agriculture";
  } else if (
    text.includes("school") ||
    text.includes("study") ||
    text.includes("education") ||
    text.includes("teacher") ||
    text.includes("tuition")
  ) {
    category = "Education";
  } else if (
    text.includes("transport") ||
    text.includes("vehicle") ||
    text.includes("ride") ||
    text.includes("delivery")
  ) {
    category = "Transportation";
  } else if (
    text.includes("clean") ||
    text.includes("house") ||
    text.includes("home") ||
    text.includes("garden")
  ) {
    category = "Home Services";
  }

  const reason =
    priority === "HIGH"
      ? "The request contains indicators of an urgent safety, emergency, or potentially hazardous situation."
      : priority === "MEDIUM"
        ? "The request describes a significant service problem that requires reasonably prompt attention."
        : "The request appears to be routine, non-emergency service or maintenance work.";

  return {
    priority,
    category,
    reason,
    confidence: 72,
  };
}

function parseAIOutput(rawOutput: string): AIAnalysis | null {
  try {
    const cleaned = rawOutput
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (
      !["HIGH", "MEDIUM", "LOW"].includes(parsed.priority) ||
      typeof parsed.category !== "string" ||
      typeof parsed.reason !== "string" ||
      typeof parsed.confidence !== "number"
    ) {
      return null;
    }

    return {
      priority: parsed.priority,
      category: parsed.category,
      reason: parsed.reason,
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence))),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing authentication token",
        },
        { status: 401 },
      );
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase configuration is missing",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication token",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const requestId = body?.requestId;

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "requestId is required",
        },
        { status: 400 },
      );
    }

    const { data: serviceRequest, error: requestError } = await supabase
      .from("service_requests")
      .select(
        `
          id,
          customer_id,
          title,
          description,
          service_id,
          service_area_id,
          services(name),
          service_areas(pincode)
        `,
      )
      .eq("id", requestId)
      .eq("customer_id", user.id)
      .single();

    if (requestError || !serviceRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "Service request not found or access denied",
        },
        { status: 404 },
      );
    }

    const serviceRelation = serviceRequest.services as
      | { name?: string }
      | { name?: string }[]
      | null;

    const areaRelation = serviceRequest.service_areas as
      | { pincode?: string | number }
      | { pincode?: string | number }[]
      | null;

    const serviceName = Array.isArray(serviceRelation)
      ? serviceRelation[0]?.name || ""
      : serviceRelation?.name || "";

    const pincode = Array.isArray(areaRelation)
      ? areaRelation[0]?.pincode?.toString() || ""
      : areaRelation?.pincode?.toString() || "";

    const title = serviceRequest.title || "";
    const description = serviceRequest.description || "";

    const userPrompt = `
Analyze this local service request for SEVA-COOP.

Service:
${serviceName || title}

Customer request:
${description || title}

Area PIN:
${pincode || "Not provided"}

Return ONLY valid JSON with exactly these fields:

{
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "category": "string",
  "reason": "short explanation",
  "confidence": number
}

Rules:

- HIGH means urgent safety risk, emergency, major damage, electrical danger, fire risk, medical urgency, security issue, or similar.
- MEDIUM means a significant problem that needs reasonably prompt service but is not an immediate emergency.
- LOW means routine maintenance, minor repair, installation, inspection, or non-urgent work.
- category should identify the practical service category, such as Electrical Repair, Plumbing, Healthcare, Agriculture, Education, Transportation, Home Services, etc.
- reason must explain the main evidence from the customer's request.
- confidence must be a number from 0 to 100.
- Do not invent facts that are not present in the request.
`;

    let analysis: AIAnalysis;
    let aiSource: "AI" | "FALLBACK" = "AI";

    /*
     * Try the real AI classifier first.
     *
     * If OpenAI credits are exhausted, the API returns 429.
     * Instead of failing the whole request, we automatically
     * use the local fallback classifier.
     */
    if (openai) {
      try {
        const completion = await openai.responses.create({
          model: MODEL,
          input: [
            {
              role: "system",
              content:
                "You are the SEVA-COOP service-priority classification engine. Analyze requests carefully and return strict JSON only.",
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
        });

        const rawOutput = completion.output_text?.trim();

        if (rawOutput) {
          const parsedAnalysis = parseAIOutput(rawOutput);

          if (parsedAnalysis) {
            analysis = parsedAnalysis;
          } else {
            console.warn(
              "AI returned invalid JSON. Using fallback classifier.",
            );

            analysis = fallbackAnalysis(
              serviceName,
              title,
              description,
            );
            aiSource = "FALLBACK";
          }
        } else {
          console.warn(
            "AI returned an empty response. Using fallback classifier.",
          );

          analysis = fallbackAnalysis(
            serviceName,
            title,
            description,
          );
          aiSource = "FALLBACK";
        }
      } catch (error) {
        console.warn(
          "AI unavailable. Using fallback classifier:",
          error instanceof Error ? error.message : error,
        );

        analysis = fallbackAnalysis(
          serviceName,
          title,
          description,
        );
        aiSource = "FALLBACK";
      }
    } else {
      console.warn(
        "AI_API_KEY is not configured. Using fallback classifier.",
      );

      analysis = fallbackAnalysis(
        serviceName,
        title,
        description,
      );
      aiSource = "FALLBACK";
    }

    const confidence = Math.min(
      100,
      Math.max(0, Number(analysis.confidence)),
    );

    const { error: updateError } = await supabase
      .from("service_requests")
      .update({
        priority: analysis.priority,
        ai_category: analysis.category,
        ai_reason: analysis.reason,
        ai_confidence: confidence,
        ai_processed_at: new Date().toISOString(),
        status: "matching",
      })
      .eq("id", requestId)
      .eq("customer_id", user.id);

    if (updateError) {
      console.error("AI database update failed:", updateError);

      return NextResponse.json(
        {
          success: false,
          error: "AI analysis succeeded but database update failed",
          details: updateError.message,
        },
        { status: 500 },
      );
    }

    /*
     * After classification, automatically find the best worker
     * using the existing Supabase RPC.
     */
    const { data: matchResult, error: matchError } =
      await supabase.rpc("assign_service_request", {
        p_request_id: requestId,
      });

    if (matchError) {
      console.error("Worker matching failed:", matchError);

      return NextResponse.json({
        success: true,
        aiSource,
        analysis: {
          priority: analysis.priority,
          category: analysis.category,
          reason: analysis.reason,
          confidence,
        },
        matching: {
          success: false,
          error: matchError.message,
        },
      });
    }

    return NextResponse.json({
      success: true,
      aiSource,
      analysis: {
        priority: analysis.priority,
        category: analysis.category,
        reason: analysis.reason,
        confidence,
      },
      matching: matchResult,
    });
  } catch (error) {
    console.error("AI request analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected AI analysis error",
      },
      { status: 500 },
    );
  }
}