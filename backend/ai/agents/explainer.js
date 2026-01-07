import { createChatCompletion } from "../openai.js";

const SYSTEM_PROMPT = `You are a code educator. Explain code clearly and concisely.

Rules:
- Break down complex concepts simply
- Explain what code does and how it works
- Be brief and clear`;

export default {
	async process({ message, codeSnapshot, language }) {
		const userPrompt = codeSnapshot
			? `Language: ${language}

Code to Explain:
\`\`\`${language}
${codeSnapshot}
\`\`\`

User's Question: ${message}

Please explain the code and answer the question in a clear, educational way.`

			: `Language: ${language}

User's Question: ${message}

Please explain this concept clearly.`;

		return await createChatCompletion({
			systemPrompt: SYSTEM_PROMPT,
			userPrompt,
		});
	},
};

