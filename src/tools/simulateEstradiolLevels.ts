import { e2multidose3C, modelList } from "estrannaise/src/models.js";
import type { Tool } from "fastmcp";
import { z } from "zod";

const modelNames = Object.keys(modelList) as [string, ...string[]];

const SimulateEstradiolLevelsSchema = z.object({
	time: z.number().min(0).describe("Time offset for dose calculation"),
	doses: z
		.array(z.number().min(0))
		.min(1)
		.describe("Dose amounts, in mg")
		.default([1.0]),
	times: z
		.array(z.number().min(0))
		.min(1)
		.describe("Dosing intervals, in days")
		.default([0.0]),
	models: z
		.array(z.enum(modelNames))
		.min(1)
		.describe("Ester/types, see `modelList` for values")
		.default(["EV im"]),
	conversionFactor: z
		.number()
		.min(0)
		.describe("Conversion factor for conversion from pg/mL to other")
		.default(1.0),
	random: z
		.boolean()
		.describe("If values need uncertainty applied")
		.default(false),
	intervals: z
		.boolean()
		.describe("True if days are set as interval")
		.default(false),
});

export const simulateEstradiolLevelsTool: Tool<
	undefined,
	typeof SimulateEstradiolLevelsSchema
> = {
	name: "simulateEstradiolLevels",
	annotations: {
		destructiveHint: false,
		readOnlyHint: true,
	},
	description:
		"Simulate estradiol levels over time. Calculate a given set of multi-doses. Offset values of `doses`, `times`, and `types` need to match.",
	parameters: SimulateEstradiolLevelsSchema,
	execute: async (input) => {
		const { doses, times, models, conversionFactor, random, intervals } = input;
		const warnings = [];

		// For multi-dose simulations, we iterate over times array
		// Other arrays can be shorter and will cycle (modulo behavior)
		// But we do want to warn if arrays are dramatically mismatched
		const maxLength = Math.max(doses.length, times.length, models.length);
		const minLength = Math.min(doses.length, times.length, models.length);

		if (maxLength > minLength * 2) {
			warnings.push(
				"Significant array length mismatch detected. This may lead to unexpected behavior.",
			);
		}

		// Validate models exist in modelList
		for (const model of models) {
			if (!(model in modelList)) {
				throw new Error(
					`Unknown model: ${model}. Available models: ${Object.keys(modelList).join(", ")}`,
				);
			}
		}

		// Validate reasonable dose ranges (basic safety check)
		const maxDose = Math.max(...doses);
		const minDose = Math.min(...doses);
		if (maxDose > 100) {
			warnings.push(
				`Very high dose detected (${maxDose}mg). Please verify this is intentional.`,
			);
		}
		if (minDose === 0 && doses.length > 1) {
			warnings.push("Zero dose detected in multi-dose simulation.");
		}

		const results = [];

		try {
			for (const [index, t] of times.entries()) {
				const level = e2multidose3C(
					t,
					doses,
					times,
					models,
					conversionFactor,
					random,
					intervals,
				);

				// Validate result is a finite number
				if (!Number.isFinite(level)) {
					throw new Error(`Invalid calculation result at time ${t}: ${level}`);
				}

				results.push({
					time: t,
					level: Math.round(level * 100) / 100, // Round to 2 decimal places
					model: models[index % models.length],
					dose: doses[index % doses.length],
				});
			}
		} catch (error) {
			throw new Error(
				`Calculation failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		// Add metadata to results
		const response = {
			results,
			metadata: {
				totalSimulations: results.length,
				conversionFactor,
				units:
					conversionFactor === 1.0 ? "pg/mL" : `pg/mL × ${conversionFactor}`,
				uncertaintyApplied: random,
				intervalsMode: intervals,
				...(warnings.length > 0 && { warnings }),
			},
		};

		return JSON.stringify(response, null, 2);
	},
};
