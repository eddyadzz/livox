
import { Type } from "@google/genai";
import { AIRsponseItems } from "../types";

// Helper to get headers with Auth token
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Use gemini-3-flash-preview for text extraction tasks
export const parseInvoiceItemsFromText = async (text: string): Promise<AIRsponseItems | null> => {
  try {
    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            model: "gemini-3-flash-preview",
            contents: `Extract invoice line items from the following text. If a rate or quantity is missing, infer a reasonable default (qty: 1). Return a JSON object with an array of items. Text: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          description: { type: Type.STRING },
                          quantity: { type: Type.NUMBER },
                          rate: { type: Type.NUMBER },
                        },
                        required: ["description", "quantity", "rate"],
                      },
                    },
                  },
                },
            }
        })
    });

    if (!response.ok) throw new Error('AI Service Failed');
    
    const data = await response.json();
    if (data.text) {
      return JSON.parse(data.text) as AIRsponseItems;
    }
    return null;

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return null;
  }
};

// Use gemini-3-flash-preview for email drafting
export const draftDocumentEmail = async (
  docType: string,
  docNumber: string,
  clientName: string,
  total: string,
  businessName: string
): Promise<{ subject: string; body: string } | null> => {
  try {
    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            model: "gemini-3-flash-preview",
            contents: `Write a professional email regarding ${docType} #${docNumber} for the amount of ${total} from ${businessName} to ${clientName}. Return a JSON object with "subject" and "body" fields. The body should be friendly but formal.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                  },
                  required: ["subject", "body"],
                },
            }
        })
    });

    if (!response.ok) throw new Error('AI Service Failed');

    const data = await response.json();
    if (data.text) {
        return JSON.parse(data.text);
    }
    return null;

  } catch (error) {
    console.error("Gemini Email Draft Error:", error);
    return null;
  }
};

// Use gemini-3-flash-preview for translation tasks
export const translateToDhivehi = async (text: string): Promise<string | null> => {
    try {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                model: "gemini-3-flash-preview",
                contents: `Translate the following text from English to Dhivehi (Maldivian). Only return the translated text in Thaana script. Text: "${text}"`
            })
        });

        if (!response.ok) throw new Error('Translation Failed');

        const data = await response.json();
        return data.text || null;
    } catch (error) {
        console.error("Gemini Translation Error:", error);
        return null;
    }
};
