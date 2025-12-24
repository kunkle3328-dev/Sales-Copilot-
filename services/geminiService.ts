import { GoogleGenAI, Type } from "@google/genai";
import { CallSummary, TranscriptItem } from "../types";

const SYSTEM_INSTRUCTION_SUMMARY = `
You are an expert sales manager. Analyze the provided transcript of a sales call.
Generate a structured summary including an overview, a list of objections raised, a draft follow-up email, and a checklist of next steps.
Return the response in JSON format.
`;

export const generateCallSummary = async (transcript: TranscriptItem[]): Promise<CallSummary> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Convert transcript to a single string for the prompt
  const transcriptText = transcript
    .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.role === 'user' ? 'Conversation' : 'Coach'}: ${t.text}`)
    .join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // Using Gemini 3 Flash for post-call analysis
    contents: `Here is the transcript of the sales call:\n\n${transcriptText}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_SUMMARY,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING, description: "A brief paragraph summarizing the call outcome." },
          objections: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of specific objections raised by the prospect." 
          },
          followUpEmail: { type: Type.STRING, description: "A professional, ready-to-send follow-up email draft." },
          actionItems: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A checklist of next steps for the salesperson." 
          }
        },
        required: ["overview", "objections", "followUpEmail", "actionItems"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No summary generated");
  }

  return JSON.parse(text) as CallSummary;
};