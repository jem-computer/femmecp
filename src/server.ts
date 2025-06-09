import { FastMCP } from "fastmcp";
import { simulateEstradiolLevelsTool } from "./tools/simulateEstradiolLevels.js";

const server = new FastMCP({
	name: "femmecp",
	version: "0.0.1",
});

server.addTool(simulateEstradiolLevelsTool);

server.start({
	transportType: "stdio",
});
