// src/lib/aiClient.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { envs } from "../envs";

export type RewriteMode = "formal" | "friendly" | "shorter" | "longer" | "fix";

const MODE_PROMPTS: Record<RewriteMode, string> = {
    formal: "Rewrite the text in a more formal and professional tone.",
    friendly: "Rewrite the text to be more friendly, warm, and casual.",
    shorter: "Rewrite the text to be more concise and shorter while keeping meaning.",
    longer: "Rewrite the text with more detail and explanation, but stay on point.",
    fix: "Fix grammar, spelling, and clarity without changing the tone or meaning.",
};

const MODEL_NAME = "gemini-2.5-flash";
const API_KEY = envs.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not set. AI calls will fail.");
}

export async function rewriteTextWithAI(text: string, mode: RewriteMode): Promise<string> {
    if (!genAI) {
        throw new Error("Missing Gemini API Key. Set VITE_GEMINI_API_KEY in your .env file.");
    }

    const instruction = MODE_PROMPTS[mode];
    const prompt = [
        "You are an assistant that rewrites emails and short messages.",
        "Always preserve the original intent, names, and facts.",
        instruction,
        "",
        "Original text:",
        `"""${text}"""`,
        "",
        "Return only the rewritten text, without commentary.",
    ].join("\n");

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                temperature: 0.4,
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text().trim();

        if (!content) {
            throw new Error("Empty response from Gemini.");
        }

        return content;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Gemini API error: ${error.message}`);
        }

        throw new Error("Unknown error while calling Gemini API.");
    }
}
