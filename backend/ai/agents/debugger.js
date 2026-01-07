import { createChatCompletion } from "../openai.js";

const SYSTEM_PROMPT = `You are a debugging expert. Find and fix bugs quickly.

Rules:
- Identify issues clearly
- Provide corrected code
- Be concise
- Format code properly`;

export default {
	async process({ message, codeSnapshot, language }) {
		const userPrompt = `Language: ${language}

Code to Debug:
\`\`\`${language}
${codeSnapshot || "// No code provided"}
\`\`\`

User's Issue/Question: ${message}

Please analyze the code, identify any bugs or issues, and provide a solution.`;

		return await createChatCompletion({
			systemPrompt: SYSTEM_PROMPT,
			userPrompt,
		});
	},
};

