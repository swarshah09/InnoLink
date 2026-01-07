import { createChatCompletion } from "../openai.js";

const SYSTEM_PROMPT = `You are an expert software engineer. Provide concise, practical coding help.

Rules:
- Be brief and direct
- Provide working code when needed
- Use the user's language
- Format code properly`;

export default {
	async process({ message, codeSnapshot, language }) {
		const userPrompt = codeSnapshot
			? `Language: ${language}

Current Code:
\`\`\`${language}
${codeSnapshot}
\`\`\`

User Question: ${message}

Please help with the above question, considering the current code context.`

			: `Language: ${language}

User Question: ${message}

Please help with the above question.`;

		return await createChatCompletion({
			systemPrompt: SYSTEM_PROMPT,
			userPrompt,
		});
	},
};

