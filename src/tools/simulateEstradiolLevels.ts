import { e2multidose3C, modelList } from "estrannaise/src/models.js";
import type { Tool } from "fastmcp";
import { z } from "zod";

/**
 * Calculate a given set of multi-doses
 * Offset values of `doses`, `times`, and `types` need to match.
 * @param {number} t time offset for dose calculation
 * @param {Array} doses Dose amounts, in mg
 * @param {Array} times Dosing intervals, in days
 * @param {Array} types Ester/types, see `methodList` for values
 * @param {number} cf conversion factor for conversion from pg/mL to other
 * @param {boolean} random if values need uncertainty applied
 * @param {boolean} intervals true if days are set as interval
 */

const modelNames = Object.keys(modelList) as [string, ...string[]];

const SimulateEstradiolLevelsSchema = z.object({
	time: z.number().min(0).describe("Time offset for dose calculation"),
	doses: z.array(z.number()).describe("Dose amounts, in mg").default([1.0]),
	times: z
		.array(z.number())
		.describe("Dosing intervals, in days")
		.default([0.0]),
	models: z
		.array(z.enum(modelNames))
		.describe("Ester/types, see `modelList` for values")
		.default(["EV im"]),
	conversionFactor: z
		.number()
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
	description: "Simulate estradiol levels over time",
	parameters: SimulateEstradiolLevelsSchema,
	execute: async (input) => {
		const { doses, times, models, conversionFactor, random, intervals } = input;
		const results = [];

		for (const t of times) {
			const level = e2multidose3C(
				t,
				doses,
				times,
				models,
				conversionFactor,
				random,
				intervals,
			);
			results.push({ time: t, level });
		}

		return JSON.stringify(results, null, 2);
	},
};
