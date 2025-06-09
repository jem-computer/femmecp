import { describe, expect, it, mock } from "bun:test";
import type { Context } from "fastmcp";
import { simulateEstradiolLevelsTool } from "./simulateEstradiolLevels.js";

// Mock the estrannaise module
mock.module("estrannaise/src/models.js", () => ({
	e2multidose3C: mock(() => 150.5), // Mock return value in pg/mL
	modelList: {
		"EB im": { units: "mg", description: "Estradiol Benzoate, Intramuscular" },
		"EV im": { units: "mg", description: "Estradiol Valerate, Intramuscular" },
		"EEn im": {
			units: "mg",
			description: "Estradiol Enanthate, Intramuscular",
		},
	},
}));

const mockContext = {} as Context<undefined>;

describe("simulateEstradiolLevelsTool", () => {
	it("should have correct metadata", () => {
		expect(simulateEstradiolLevelsTool.name).toBe("simulateEstradiolLevels");
		expect(simulateEstradiolLevelsTool.description).toBe(
			"Simulate estradiol levels over time",
		);
		expect(simulateEstradiolLevelsTool.annotations?.destructiveHint).toBe(
			false,
		);
		expect(simulateEstradiolLevelsTool.annotations?.readOnlyHint).toBe(true);
	});

	it("should validate schema with default values", () => {
		const validInput = {
			time: 24,
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(validInput);
		expect(result?.success).toBe(true);

		if (result?.success) {
			expect(result.data.doses).toEqual([1.0]);
			expect(result.data.times).toEqual([0.0]);
			expect(result.data.models).toEqual(["EV im"]);
			expect(result.data.conversionFactor).toBe(1.0);
			expect(result.data.random).toBe(false);
			expect(result.data.intervals).toBe(false);
		}
	});

	it("should validate schema with custom values", () => {
		const validInput = {
			time: 48,
			doses: [2.0, 1.5],
			times: [0, 7],
			models: ["EV im", "EB im"],
			conversionFactor: 3.6713,
			random: true,
			intervals: true,
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(validInput);
		expect(result?.success).toBe(true);
		expect(result?.data).toEqual(validInput);
	});

	it("should reject invalid model names", () => {
		const invalidInput = {
			time: 24,
			models: ["INVALID_MODEL"],
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(invalidInput);
		expect(result?.success).toBe(false);
	});

	it("should reject negative time values", () => {
		const invalidInput = {
			time: -24,
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(invalidInput);
		expect(result?.success).toBe(false);
	});

	it("should execute and return simulation results", async () => {
		const input = {
			time: 24,
			doses: [2.0],
			times: [0, 7, 14],
			models: ["EV im"],
			conversionFactor: 1.0,
			random: false,
			intervals: false,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult).toHaveProperty("results");
		expect(parsedResult).toHaveProperty("metadata");
		expect(Array.isArray(parsedResult.results)).toBe(true);
		expect(parsedResult.results).toHaveLength(3); // Should match times array length

		for (const [index, point] of parsedResult.results.entries()) {
			expect(point).toHaveProperty("time", input.times[index]);
			expect(point).toHaveProperty("level", 150.5); // Mocked value
			expect(point).toHaveProperty("model");
			expect(point).toHaveProperty("dose");
		}

		expect(parsedResult.metadata.totalSimulations).toBe(3);
		expect(parsedResult.metadata.conversionFactor).toBe(1.0);
	});

	it("should handle single dose scenario", async () => {
		const input = {
			time: 24,
			doses: [1.0],
			times: [0],
			models: ["EV im"],
			conversionFactor: 1.0,
			random: false,
			intervals: false,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.results).toHaveLength(1);
		expect(parsedResult.results[0]).toMatchObject({
			time: 0,
			level: 150.5,
		});
	});

	it("should handle multiple models", async () => {
		const input = {
			time: 24,
			doses: [1.0, 2.0],
			times: [0, 7],
			models: ["EV im", "EB im"],
			conversionFactor: 1.0,
			random: false,
			intervals: false,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.results).toHaveLength(2);
		expect(parsedResult.results[0].time).toBe(0);
		expect(parsedResult.results[1].time).toBe(7);
	});

	it("should format results as valid JSON", async () => {
		const input = {
			time: 24,
			times: [0, 1, 2],
			doses: [1.0],
			models: ["EV im"],
			conversionFactor: 1.0,
			random: false,
			intervals: false,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);

		// Should not throw when parsing
		expect(() => JSON.parse(result as string)).not.toThrow();

		// Should be formatted (with indentation)
		expect(result).toContain("  ");
	});

	it("should reject negative doses", () => {
		const invalidInput = {
			time: 24,
			doses: [-1.0],
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(invalidInput);
		expect(result?.success).toBe(false);
	});

	it("should reject negative times", () => {
		const invalidInput = {
			time: 24,
			times: [-1.0],
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(invalidInput);
		expect(result?.success).toBe(false);
	});

	it("should reject empty arrays", () => {
		const invalidInput = {
			time: 24,
			doses: [],
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(invalidInput);
		expect(result?.success).toBe(false);
	});

	it("should reject negative conversion factor", () => {
		const invalidInput = {
			time: 24,
			conversionFactor: -1.0,
		};

		const result =
			simulateEstradiolLevelsTool.parameters?.safeParse(invalidInput);
		expect(result?.success).toBe(false);
	});

	it("should warn for significantly mismatched array lengths", async () => {
		const input = {
			time: 24,
			doses: [1.0],
			times: [0, 7, 14, 21, 28],
			models: ["EV im"],
			conversionFactor: 1.0,
			random: false,
			intervals: false,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.metadata.warnings).toBeDefined();
		expect(parsedResult.metadata.warnings[0]).toContain(
			"array length mismatch",
		);
	});

	it("should include warnings for high doses", async () => {
		const input = {
			time: 24,
			doses: [150.0],
			times: [0],
			models: ["EV im"],
			conversionFactor: 1.0,
			random: false,
			intervals: false,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.metadata.warnings).toBeDefined();
		expect(parsedResult.metadata.warnings[0]).toContain("Very high dose");
	});

	it("should include warnings for zero doses", async () => {
		const input = {
			time: 24,
			doses: [0, 1.0],
			times: [0, 7],
			models: ["EV im", "EV im"],
			conversionFactor: 1.0,
			random: false,
			intervals: false,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.metadata.warnings).toBeDefined();
		expect(parsedResult.metadata.warnings[0]).toContain("Zero dose detected");
	});

	it("should include metadata in response", async () => {
		const input = {
			time: 24,
			doses: [1.0],
			times: [0, 1, 2],
			models: ["EV im"],
			conversionFactor: 3.6713,
			random: true,
			intervals: true,
		};

		const result = await simulateEstradiolLevelsTool.execute(
			input,
			mockContext,
		);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.metadata).toMatchObject({
			totalSimulations: 3,
			conversionFactor: 3.6713,
			units: "pg/mL × 3.6713",
			uncertaintyApplied: true,
			intervalsMode: true,
		});
	});
});
