import codeAssistant from "./agents/codeAssistant.js";
import debuggerAgent from "./agents/debugger.js";
import explainerAgent from "./agents/explainer.js";
import refactorAgent from "./agents/refactor.js";

/**
 * Routes user message to the appropriate AI agent
 */
export function routeAgent(userMessage) {
	const message = userMessage.toLowerCase();

	// Debugging agent
	if (
		message.includes("error") ||
		message.includes("bug") ||
		message.includes("not working") ||
		message.includes("broken") ||
		message.includes("fix") ||
		message.includes("issue") ||
		message.includes("problem")
	) {
		return "debugger";
	}

	// Explainer agent
	if (
		message.includes("explain") ||
		message.includes("what does") ||
		message.includes("how does") ||
		message.includes("why") ||
		message.includes("meaning") ||
		message.includes("understand")
	) {
		return "explainer";
	}

	// Refactor agent
	if (
		message.includes("optimize") ||
		message.includes("refactor") ||
		message.includes("improve") ||
		message.includes("better") ||
		message.includes("clean") ||
		message.includes("simplify")
	) {
		return "refactor";
	}

	// Default to code assistant
	return "codeAssistant";
}

/**
 * Main orchestrator function
 */
export async function processAIRequest({ message, codeSnapshot, language = "javascript" }) {
		const agentType = routeAgent(message);

	switch (agentType) {
		case "debugger":
			return await debuggerAgent.process({ message, codeSnapshot, language });
		
		case "explainer":
			return await explainerAgent.process({ message, codeSnapshot, language });
		
		case "refactor":
			return await refactorAgent.process({ message, codeSnapshot, language });
		
		default:
			return await codeAssistant.process({ message, codeSnapshot, language });
	}
}

