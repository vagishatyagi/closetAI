import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../config/aiConfig';
import { logger } from './logger';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  logger.warn('Warning: GEMINI_API_KEY is missing from environment variables.');
}

// Initialize the Google Generative AI Client
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Interface representing the structured fashion attributes parsed by Gemini.
 */
export interface WardrobeTags {
  category: 'Top' | 'Bottom' | 'Outerwear' | 'Footwear' | 'Accessory' | 'One-piece';
  subCategory: string;
  colorFamily: string;
  pattern: 'Solid' | 'Striped' | 'Plaid' | 'Floral' | 'Graphic' | 'Houndstooth' | 'Textured';
  fabric: string;
  formality: 'Formal' | 'Smart Casual' | 'Casual' | 'Athletic' | 'Loungewear';
  primaryAesthetic: string;
  weatherSuitability: {
    minTempF: number;
    maxTempF: number;
    precipitationResistant: boolean;
  };
}

/**
 * Helper to convert a Base64 string into the format expected by the Google AI SDK.
 */
function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

/**
 * 1. Multi-Modal Auto-Tagger using Gemini 1.5 Flash
 * Analyzes a clothing photo and extracts detailed tags as a structured object.
 */
export async function generateWardrobeTags(
  imageBase64: string,
  mimeType: string
): Promise<WardrobeTags> {
  const functionName = 'generateWardrobeTags';
  logger.info(functionName, { mimeType, imageLength: imageBase64.length });

  try {
    const modelName = AI_CONFIG.models.tagger;
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: AI_CONFIG.systemInstructions.tagger,
    });

    const imagePart = fileToGenerativePart(imageBase64, mimeType);
    const prompt = 'Analyze this clothing item and return the fashion tags strictly in JSON format as instructed.';

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim();

    // Log the raw AI transaction
    logger.ai(modelName, prompt, { temperature: AI_CONFIG.params.temperature }, responseText);

    // Clean up potentially returned markdown wrappers
    const jsonString = responseText
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const tags: WardrobeTags = JSON.parse(jsonString);
    return tags;
  } catch (error) {
    logger.error(`Error in ${functionName}`, error);
    throw new Error('Failed to parse clothing tags using Google Gemini AI.');
  }
}

/**
 * 2. Generate Style Embeddings (text-embedding-004)
 * Generates a 1536-dimensional vector embedding of the style tags.
 */
export async function generateStyleEmbedding(text: string): Promise<number[]> {
  const functionName = 'generateStyleEmbedding';
  logger.info(functionName, { textLength: text.length });

  try {
    const modelName = AI_CONFIG.models.embedding;
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.embedContent(text);
    const embedding = result.embedding.values;

    logger.ai(modelName, `Embed text: "${text.slice(0, 100)}..."`, {}, `[Embedding values count: ${embedding.length}]`);
    return embedding;
  } catch (error) {
    logger.error(`Error in ${functionName}`, error);
    throw new Error('Failed to generate vector embedding.');
  }
}

/**
 * 3. Daily Outfit of the Day (OOTD) Synthesis using Gemini 3.1 Pro
 * Synthesizes weather, schedule, closet metadata, and past feedbacks into high-fidelity pairings.
 */
export async function generateOOTD(
  weatherPayload: any,
  calendarPayload: any,
  closetPayload: any[],
  feedbackPayload: any[]
): Promise<any> {
  const functionName = 'generateOOTD';
  logger.info(functionName, {
    weather: weatherPayload,
    calendarEventsCount: calendarPayload?.length || 0,
    closetItemsCount: closetPayload?.length || 0,
    feedbacksCount: feedbackPayload?.length || 0,
  });

  try {
    const modelName = AI_CONFIG.models.planner;
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: AI_CONFIG.systemInstructions.planner,
    });

    const userContext = {
      weather: weatherPayload,
      calendar: calendarPayload,
      closet: closetPayload.map(item => ({
        id: item.id,
        category: item.category,
        subCategory: item.sub_category,
        colorFamily: item.color_family,
        pattern: item.pattern,
        fabric: item.fabric,
        formality: item.formality,
        minTemp: item.min_temp,
        maxTemp: item.max_temp,
        precipitationResistant: item.precipitation_resistant
      })),
      stylePreferences: feedbackPayload
    };

    const prompt = `Synthesize today's OOTD recommendations. Context data:\n${JSON.stringify(userContext, null, 2)}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: AI_CONFIG.params.plannerTemperature,
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text().trim();
    logger.ai(modelName, 'Synthesizing closet matching schedule...', { temperature: AI_CONFIG.params.plannerTemperature }, responseText);

    return JSON.parse(responseText);
  } catch (error) {
    logger.error(`Error in ${functionName}`, error);
    throw new Error('Failed to generate daily OOTD using Gemini 3.1 Pro.');
  }
}
