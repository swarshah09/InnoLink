/**
 * Google Gemini AI Integration (Free Tier)
 * Uses Google Gemini for AI inference - free for developers!
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Map user-friendly names to actual model names
const MODEL_MAP = {
	"gemini-pro": "gemini-pro",
	"gemini-1.5-pro": "gemini-1.5-pro",
	"gemini-1.5-flash": "gemini-1.5-flash",
	"gemini-1.5-flash-latest": "gemini-1.5-flash-latest",
};

let requestedModel = (process.env.GEMINI_MODEL || "gemini-pro").trim();
// Remove any comments from the model name
requestedModel = requestedModel.split('#')[0].trim();
const GEMINI_MODEL = MODEL_MAP[requestedModel] || "gemini-pro";

// Initialize Gemini client
let genAI = null;
let availableModels = null; // Cache available models

if (GEMINI_API_KEY) {
	genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Check available models from the API
 */
async function checkAvailableModels() {
	if (availableModels !== null) return availableModels;
	
	try {
		if (!GEMINI_API_KEY) return [];
		
		const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
		if (response.ok) {
			const data = await response.json();
			const models = data.models?.filter(m => 
				m.supportedGenerationMethods?.includes('generateContent') || 
				m.supportedGenerationMethods?.includes('streamGenerateContent')
			).map(m => {
				// Remove "models/" prefix if present
				const name = m.name?.replace(/^models\//, '') || '';
				return name;
			}) || [];
			availableModels = models;
			return models;
		}
	} catch (e) {
		// Silently fail - will use fallback model list
	}
	return [];
}


/**
 * Get user-friendly error message
 */
function getErrorMessage(error) {
	if (!error) {
		return "An unknown error occurred";
	}

	// Handle API key errors
	if (error.message?.includes("API_KEY") || error.message?.includes("api key")) {
		return "Google Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.\n\nGet your free API key at: https://aistudio.google.com/app/apikey";
	}

	// Handle quota/rate limit errors
	if (error.message?.includes("quota") || error.message?.includes("rate limit") || error.message?.includes("429") || error.status === 429) {
		const retryDelay = error.errorDetails?.find(d => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo")?.retryDelay || "60";
		return `⏱️ Rate limit exceeded. Please wait ${retryDelay} seconds and try again.\n\nFree tier limits:\n- 60 requests/minute\n- 1,500 requests/day\n\nTo check your quota: https://ai.google.dev/usage?tab=rate-limit`;
	}

	// Handle authentication errors
	if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
		return "Invalid Google Gemini API key. Please check your GEMINI_API_KEY in the .env file.";
	}

	// Handle model not found errors
	if (error.message?.includes("404") || error.message?.includes("not found") || error.message?.includes("not supported")) {
		return `Model "${GEMINI_MODEL}" not found or not supported.\n\nAvailable models:\n- gemini-pro\n- gemini-1.5-pro\n\nUpdate GEMINI_MODEL in your .env file.`;
	}

	return error.message || "Failed to get AI response. Please check your API key and try again.";
}

/**
 * Create a streaming chat completion using Google Gemini
 */
export async function* createChatCompletionStream({ systemPrompt, userPrompt }) {
	try {
		if (!GEMINI_API_KEY) {
			throw new Error("GEMINI_API_KEY not configured. Please set it in your .env file.\n\nGet your free API key at: https://aistudio.google.com/app/apikey");
		}

		if (!genAI) {
			genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
		}

		// Combine system and user prompts (Gemini doesn't support systemInstruction in all API versions)
		const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

		// Check available models first, then try them
		const available = await checkAvailableModels();
		
		// Prioritize FASTEST models (lite models are fastest)
		const fastestModels = [
			"gemini-2.0-flash-lite-001",
			"gemini-2.0-flash-lite",
			"gemini-2.5-flash-lite",
			"gemini-flash-lite-latest",
			"gemini-2.0-flash",
			"gemini-2.5-flash",
			"gemini-flash-latest"
		];
		
		// Build list - prioritize fastest available models first
		const modelsToTry = available.length > 0 
			? [
				...fastestModels.filter(m => available.includes(m)), // Fastest available first
				...available.filter(m => !fastestModels.includes(m)) // Other available models
			]
			: fastestModels;

		let result;
		let lastError;
		let triedModels = [];
		
		for (const modelName of modelsToTry) {
			if (triedModels.includes(modelName)) continue; // Skip duplicates
			triedModels.push(modelName);
			
			try {
				const model = genAI.getGenerativeModel({ 
					model: modelName,
					generationConfig: {
						maxOutputTokens: 800, // Reduced for faster responses
						temperature: 0.7,
						topP: 0.9,
						topK: 40,
					}
				});
				result = await model.generateContentStream(fullPrompt);
				break; // Success, exit loop
			} catch (modelError) {
				lastError = modelError;
				// If it's a 404 or model not found, try next model
				if (modelError.status === 404 || modelError.message?.includes("404") || modelError.message?.includes("not found")) {
					continue; // Try next model
				}
				// If it's a quota/rate limit error, try next model (different model might have different quota)
				if (modelError.status === 429 || modelError.message?.includes("quota") || modelError.message?.includes("rate limit")) {
					continue; // Try next model
				}
				// For other errors (auth, etc.), throw immediately
				throw modelError;
			}
		}

		if (!result) {
			const availableList = available.length > 0 ? available.join(", ") : "none found";
			// Check if all failures were due to quota
			const allQuotaErrors = lastError?.status === 429 || lastError?.message?.includes("quota") || lastError?.message?.includes("rate limit");
			if (allQuotaErrors) {
				throw new Error(`⏱️ All models hit rate limits. Please wait a minute and try again.\n\nFree tier limits:\n- 60 requests/minute\n- 1,500 requests/day\n\nCheck quota: https://ai.google.dev/usage?tab=rate-limit`);
			}
			throw new Error(`No available Gemini models found. Tried: ${triedModels.join(", ")}\nAvailable models: ${availableList}\n\nPlease check your API key permissions at https://aistudio.google.com/app/apikey`);
		}
		
		// Stream the response
		for await (const chunk of result.stream) {
			const chunkText = chunk.text();
			if (chunkText) {
				yield chunkText;
			}
		}
	} catch (error) {
		console.error("Gemini API Error:", error);
		const errorMessage = getErrorMessage(error);
		throw new Error(errorMessage);
	}
}

/**
 * Create a non-streaming chat completion (fallback)
 */
export async function createChatCompletion({ systemPrompt, userPrompt }) {
	try {
		if (!GEMINI_API_KEY) {
			throw new Error("GEMINI_API_KEY not configured. Please set it in your .env file.\n\nGet your free API key at: https://aistudio.google.com/app/apikey");
		}

		if (!genAI) {
			genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
		}

		// Combine system and user prompts
		const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

		// Check available models first, then try them
		const available = await checkAvailableModels();
		
		// Prioritize FASTEST models (but skip lite if they have quota issues)
		// Mix of lite and regular flash models to avoid quota limits
		const fastestModels = [
			"gemini-2.0-flash-lite-001",
			"gemini-2.0-flash-lite",
			"gemini-2.5-flash-lite",
			"gemini-2.0-flash", // Regular flash (different quota pool)
			"gemini-2.5-flash", // Regular flash (different quota pool)
			"gemini-flash-lite-latest",
			"gemini-flash-latest"
		];
		
		// Build list - prioritize fastest available models first
		const modelsToTry = available.length > 0 
			? [
				...fastestModels.filter(m => available.includes(m)), // Fastest available first
				...available.filter(m => !fastestModels.includes(m)) // Other available models
			]
			: fastestModels;

		let result;
		let lastError;
		let triedModels = [];
		
		for (const modelName of modelsToTry) {
			if (triedModels.includes(modelName)) continue; // Skip duplicates
			triedModels.push(modelName);
			
			try {
				const model = genAI.getGenerativeModel({ 
					model: modelName,
					generationConfig: {
						maxOutputTokens: 800, // Reduced for faster responses
						temperature: 0.7,
						topP: 0.9,
						topK: 40,
					}
				});
				result = await model.generateContent(fullPrompt);
				break; // Success, exit loop
			} catch (modelError) {
				lastError = modelError;
				// If it's a 404 or model not found, try next model
				if (modelError.status === 404 || modelError.message?.includes("404") || modelError.message?.includes("not found")) {
					continue; // Try next model
				}
				// If it's a quota/rate limit error, try next model (different model might have different quota)
				if (modelError.status === 429 || modelError.message?.includes("quota") || modelError.message?.includes("rate limit")) {
					continue; // Try next model
				}
				// For other errors (auth, etc.), throw immediately
				throw modelError;
			}
		}

		if (!result) {
			const availableList = available.length > 0 ? available.join(", ") : "none found";
			// Check if all failures were due to quota
			const allQuotaErrors = lastError?.status === 429 || lastError?.message?.includes("quota") || lastError?.message?.includes("rate limit");
			if (allQuotaErrors) {
				throw new Error(`⏱️ All models hit rate limits. Please wait a minute and try again.\n\nFree tier limits:\n- 60 requests/minute\n- 1,500 requests/day\n\nCheck quota: https://ai.google.dev/usage?tab=rate-limit`);
			}
			throw new Error(`No available Gemini models found. Tried: ${triedModels.join(", ")}\nAvailable models: ${availableList}\n\nPlease check your API key permissions at https://aistudio.google.com/app/apikey`);
		}
		const response = result.response;
		const text = response.text();

		return {
			content: text || "No response generated.",
		};
	} catch (error) {
		console.error("Gemini API Error:", error);
		const errorMessage = getErrorMessage(error);
		throw new Error(errorMessage);
	}
}
