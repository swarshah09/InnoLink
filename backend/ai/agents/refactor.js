import { createChatCompletion } from "../openai.js";

const SYSTEM_PROMPT = `You are a refactoring expert. Improve code while keeping functionality.

Rules:
- Optimize for readability and performance
- Follow best practices
- Explain improvements briefly
- Format code properly`;

export default {
	async process({ message, codeSnapshot, language }) {
		if (!codeSnapshot) {
			return {
				content: "I need to see your code to help refactor it. Please share the code you'd like me to improve.",
			};
		}

		const userPrompt = `Language: ${language}

Current Code:
\`\`\`${language}
${codeSnapshot}
\`\`\`

User's Request: ${message}

Please refactor this code to make it cleaner, more efficient, and follow best practices. Explain the improvements made.`;

		return await createChatCompletion({
			systemPrompt: SYSTEM_PROMPT,
			userPrompt,
		});
	},
};

