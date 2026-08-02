import { GoogleGenAI, Type } from "@google/genai";
import { VisionExtraction, AssetItem } from "../types";

export async function analyzeHardwareImage(base64Image: string): Promise<VisionExtraction> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1], // Remove "data:image/jpeg;base64,"
          },
        },
        {
          text: `You are an IT Asset Audit Specialist and Vision AI.
Extract the following from the provided image of IT hardware:
- Serial (Serial / Service Tag)
- Category (e.g. Workstation, Peripheral, Networking)
- Manufacturer (Normalized, e.g., 'Dell')
- Model
- ModelNumber

If the serial is illegible or the model is ambiguous, indicate that clarification is needed and write a message to the user asking for the specific missing information.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          serial: { type: Type.STRING, description: "The serial number or service tag. Null if not found." },
          category: { type: Type.STRING, description: "Category of the asset." },
          manufacturer: { type: Type.STRING, description: "Manufacturer name, normalized." },
          model: { type: Type.STRING, description: "Model name." },
          modelNumber: { type: Type.STRING, description: "Specific model number." },
          messageToUser: { type: Type.STRING, description: "Message to ask the user if info is missing or illegible." },
          needsClarification: { type: Type.BOOLEAN, description: "True if serial or important info is missing and requires user input." }
        },
        required: ["needsClarification"]
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  try {
    return JSON.parse(jsonStr) as VisionExtraction;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      serial: null,
      category: null,
      manufacturer: null,
      model: null,
      modelNumber: null,
      needsClarification: true,
      messageToUser: "No pude procesar la imagen correctamente. ¿Podrías indicarme el Serial y Modelo?"
    };
  }
}

export async function generateITAMReport(assets: AssetItem[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const assetsJson = JSON.stringify(assets, null, 2);
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Eres un Especialista en Auditoría de Activos IT. Con base en el siguiente inventario JSON, redacta un informe estructurado siguiendo principios de ITAM (IT Asset Management).
    
El informe debe incluir las siguientes secciones obligatorias:
1. Resumen Ejecutivo
2. Análisis de Ciclo de Vida
3. Recomendaciones de Reposición

Inventario:
${assetsJson}

Formatea tu respuesta en Markdown para ser renderizada en un componente tipo Google Docs.`,
  });

  return response.text || "";
}
