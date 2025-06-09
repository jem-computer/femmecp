import { describe, expect, it, mock } from "bun:test";
import type { Context } from "fastmcp";
import { getModelParametersTool } from "./getModelParameters.js";

// Mock the estrannaise module
mock.module("estrannaise/src/models.js", () => ({
	modelList: {
		"EV im": { units: "mg", description: "Estradiol Valerate, Intramuscular" },
		"EB im": { units: "mg", description: "Estradiol Benzoate, Intramuscular" },
	},
	PKParameters: {
		"EV im": [0.5, 0.1, 0.05, 0.02],
		"EB im": [0.3, 0.15, 0.08, 0.025],
	},
	availableUnits: {
		"pg/mL": { units: "pg/mL", conversionFactor: 1.0, precision: 0 },
		"pmol/L": { units: "pmol/L", conversionFactor: 3.6713, precision: 0 },
		"ng/L": { units: "ng/L", conversionFactor: 1.0, precision: 0 },
	},
}));

const mockContext = {} as Context<undefined>;

describe("getModelParametersTool", () => {
	it("should have correct metadata", () => {
		expect(getModelParametersTool.name).toBe("getModelParameters");
		expect(getModelParametersTool.description).toBe(
			"Get pharmacokinetic parameters and information for a specific estradiol model",
		);
		expect(getModelParametersTool.annotations?.destructiveHint).toBe(false);
		expect(getModelParametersTool.annotations?.readOnlyHint).toBe(true);
	});

	it("should validate schema with valid model", () => {
		const validInput = {
			model: "EV im",
		};

		const result = getModelParametersTool.parameters?.safeParse(validInput);
		expect(result?.success).toBe(true);

		if (result?.success) {
			expect(result.data.model).toBe("EV im");
			expect(result.data.includeUnits).toBe(true);
			expect(result.data.unit).toBe("pg/mL");
		}
	});

	it("should validate schema with custom values", () => {
		const validInput = {
			model: "EB im",
			includeUnits: false,
			unit: "pmol/L",
		};

		const result = getModelParametersTool.parameters?.safeParse(validInput);
		expect(result?.success).toBe(true);
		expect(result?.data).toEqual(validInput);
	});

	it("should reject invalid model names", () => {
		const invalidInput = {
			model: "INVALID_MODEL",
		};

		const result = getModelParametersTool.parameters?.safeParse(invalidInput);
		expect(result?.success).toBe(false);
	});

	it("should return model parameters with units", async () => {
		const input = {
			model: "EV im",
			includeUnits: true,
			unit: "pg/mL",
		};

		const result = await getModelParametersTool.execute(input, mockContext);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.model).toBe("EV im");
		expect(parsedResult.description).toBe("Estradiol Valerate, Intramuscular");
		expect(parsedResult.doseUnits).toBe("mg");
		expect(parsedResult.pharmacokineticParameters).toEqual({
			d: { value: 0.5, description: "Absorption delay parameter" },
			k1: { value: 0.1, description: "Absorption rate constant (1/hours)" },
			k2: { value: 0.05, description: "Distribution rate constant (1/hours)" },
			k3: { value: 0.02, description: "Elimination rate constant (1/hours)" },
		});
		expect(parsedResult.units).toBeDefined();
		expect(parsedResult.units.current).toBe("pg/mL");
		expect(parsedResult.units.conversionFactor).toBe(1.0);
	});

	it("should return model parameters without units when requested", async () => {
		const input = {
			model: "EB im",
			includeUnits: false,
			unit: "pmol/L",
		};

		const result = await getModelParametersTool.execute(input, mockContext);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.model).toBe("EB im");
		expect(parsedResult.description).toBe("Estradiol Benzoate, Intramuscular");
		expect(parsedResult.doseUnits).toBe("mg");
		expect(parsedResult.pharmacokineticParameters).toEqual({
			d: { value: 0.3, description: "Absorption delay parameter" },
			k1: { value: 0.15, description: "Absorption rate constant (1/hours)" },
			k2: { value: 0.08, description: "Distribution rate constant (1/hours)" },
			k3: { value: 0.025, description: "Elimination rate constant (1/hours)" },
		});
		expect(parsedResult.units).toBeUndefined();
	});

	it("should handle different unit systems", async () => {
		const input = {
			model: "EV im",
			includeUnits: true,
			unit: "pmol/L",
		};

		const result = await getModelParametersTool.execute(input, mockContext);
		const parsedResult = JSON.parse(result as string);

		expect(parsedResult.units.current).toBe("pmol/L");
		expect(parsedResult.units.conversionFactor).toBe(3.6713);
	});

	it("should format results as valid JSON", async () => {
		const input = {
			model: "EV im",
		};

		const result = await getModelParametersTool.execute(input, mockContext);

		// Should not throw when parsing
		expect(() => JSON.parse(result as string)).not.toThrow();

		// Should be formatted (with indentation)
		expect(result).toContain("  ");
	});

	it("should throw error for non-existent model", async () => {
		// We need to test this at the execution level since schema validation prevents it
		// This test ensures our error handling works if someone bypasses validation
		const mockInput = {
			model: "NONEXISTENT",
			includeUnits: true,
			unit: "pg/mL",
		};

		// Create a version of the tool that bypasses schema validation
		const toolWithBypassedValidation = {
			...getModelParametersTool,
			execute: getModelParametersTool.execute,
		};

		await expect(
			toolWithBypassedValidation.execute(
				mockInput as typeof mockInput & { model: string },
				mockContext,
			),
		).rejects.toThrow("Model 'NONEXISTENT' not found");
	});
});
