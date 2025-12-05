import { GoogleGenAI, Type } from "@google/genai";
import { AIParsedResult } from '../types';

// Initialize Gemini (lazy initialization to handle missing API key)
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not set");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const parseNaturalLanguageToQR = async (prompt: string): Promise<AIParsedResult> => {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Interpret this request: "${prompt}" and convert it into the most appropriate structured string format for a QR code. 
      
      Examples:
      - "Wifi for Home with password 1234" -> WIFI:T:WPA;S:Home;P:1234;;
      - "Contact card for John Doe, 555-1234, john@email.com" -> BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;;\nFN:John Doe\nTEL;TYPE=CELL:555-1234\nEMAIL:john@email.com\nEND:VCARD
      - "Send sms to 12345 saying hello" -> SMSTO:12345:hello
      - "Email test@test.com subject Hi body Hello" -> mailto:test@test.com?subject=Hi&body=Hello
      - "Go to google.com" -> https://google.com
      
      If it is just general text, return the text as is.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "The type of QR code detected (WiFi, vCard, URL, etc)" },
            content: { type: Type.STRING, description: "The formatted string ready for the QR code generator" },
            explanation: { type: Type.STRING, description: "A very short summary of what was generated" }
          },
          required: ["type", "content", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIParsedResult;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return {
      type: "Error",
      content: prompt, // Fallback to raw text
      explanation: "Could not interpret with AI, using raw text."
    };
  }
};
