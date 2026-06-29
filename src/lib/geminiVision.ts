import { GoogleGenAI } from '@google/genai';
import { ProductLookupData } from '../types';

const VISION_MODEL =
  import.meta.env.VITE_GEMINI_LIVE_MODEL?.trim() || 'gemini-2.0-flash-exp';

function getClient(): GoogleGenAI {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY manquante pour la reconnaissance image.');
  }
  return new GoogleGenAI({ apiKey: key });
}

async function fileToBase64DataUrl(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error('Impossible de lire le fichier image.'));
    reader.readAsDataURL(file);
  });
  return dataUrl;
}

function extractJsonBlock(text: string): string {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    return text;
  }
  return text.slice(first, last + 1);
}

export interface RecognizedProduct {
  name: string;
  brand?: string;
  category?: string;
  format?: string;
  imageUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  raw?: string;
}

export async function recognizeProductFromImage(
  image: File,
): Promise<RecognizedProduct> {
  const dataUrl = await fileToBase64DataUrl(image);
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error("Format d'image invalide.");
  }

  const prompt = `Tu es un assistant specialise dans l'identification de produits de supermarche a partir d'une photo.

Regles :
- Analyse uniquement ce qui est visible sur l'etiquette / packaging.
- Reponds UNIQUEMENT en JSON strict (pas de texte hors JSON).
- Ne jamais inventer de code-barres.
- Champs attendus : name (string, requis), brand (string | null), category (string | null), format (string | null), imageUrl (string | null), confidence ('high'|'medium'|'low').

Exemple de sortie attendue :
{
  "name": "Coca-Cola Original",
  "brand": "Coca-Cola",
  "category": "Boissons",
  "format": "33 cl",
  "imageUrl": null,
  "confidence": "high"
}`;

  const client = getClient();
  const result = await client.models.generateContent({
    model: VISION_MODEL,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: image.type || 'image/jpeg',
              data: base64,
            },
          },
          { text: prompt },
        ],
      },
    ],
  });

  const text = result.text?.trim() ?? '';
  if (!text) {
    return {
      name: 'Produit inconnu',
      confidence: 'low',
      raw: '',
    };
  }

  const jsonCandidate = extractJsonBlock(text);
  let parsed: RecognizedProduct | null = null;
  try {
    parsed = JSON.parse(jsonCandidate) as RecognizedProduct;
  } catch {
    parsed = null;
  }

  if (!parsed || !parsed.name || parsed.name === 'Produit inconnu') {
    return {
      name: parsed?.name?.trim() || 'Produit inconnu',
      brand: parsed?.brand,
      category: parsed?.category,
      format: parsed?.format,
      imageUrl: parsed?.imageUrl,
      confidence: parsed?.confidence || 'low',
      raw: text,
    };
  }

  return {
    name: parsed.name.trim(),
    brand: parsed.brand || undefined,
    category: parsed.category || undefined,
    format: parsed.format || undefined,
    imageUrl: parsed.imageUrl || undefined,
    confidence: parsed.confidence || 'medium',
    raw: text,
  };
}
