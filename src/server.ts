import { FastMCP } from "fastmcp";

const server = new FastMCP({
	name: "femmecp",
	version: "1.0.0",
});

server.addResource({
	async load() {
		return {
			text: "Example log content",
		};
	},
	mimeType: "text/plain",
	name: "Application Logs",
	uri: "file:///logs/app.log",
});

server.addPrompt({
	arguments: [
		{
			description: "Git diff or description of changes",
			name: "changes",
			required: true,
		},
	],
	description: "Generate a Git commit message",
	load: async (args) => {
		return `Generate a concise but descriptive commit message for these changes:\n\n${args.changes}`;
	},
	name: "git-commit",
});

server.start({
	transportType: "stdio",
});
