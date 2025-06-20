import { FastMCP } from "fastmcp";
import { getModelParametersTool } from "./tools/getModelParameters.js";
import { simulateEstradiolLevelsTool } from "./tools/simulateEstradiolLevels.js";

const server = new FastMCP({
	name: "FemmeCP",
	instructions:
		"FemmeCP is a MCP server for the simulation of feminizing bioidentical hormone replacement therapy.",
	version: "0.0.1",
});

server.addTool(simulateEstradiolLevelsTool);
server.addTool(getModelParametersTool);

server.start({
	transportType: "stdio",
});
