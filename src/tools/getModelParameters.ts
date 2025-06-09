import {
	PKParameters,
	availableUnits,
	modelList,
} from "estrannaise/src/models.js";
import type { Tool } from "fastmcp";
import { z } from "zod";

const modelNames = Object.keys(modelList) as [string, ...string[]];
const unitNames = Object.keys(availableUnits) as [string, ...string[]];

const GetModelParametersSchema = z.object({
	model: z.enum(modelNames).describe("The model to get parameters for"),
	includeUnits: z
		.boolean()
		.describe("Whether to include unit conversion information")
		.default(true),
	unit: z
		.enum(unitNames)
		.describe("Unit system to use for display")
		.default("pg/mL"),
});

export const getModelParametersTool: Tool<
	undefined,
	typeof GetModelParametersSchema
> = {
	name: "getModelParameters",
	annotations: {
		destructiveHint: false,
		readOnlyHint: true,
	},
	description:
		"Get pharmacokinetic parameters and information for a specific estradiol model",
	parameters: GetModelParametersSchema,
	execute: async (input) => {
		const { model, includeUnits, unit } = input;

		// Get basic model info
		const modelInfo = modelList[model];
		if (!modelInfo) {
			throw new Error(`Model '${model}' not found`);
		}

		// Get PK parameters
		const pkParams = PKParameters[model];
		if (!pkParams) {
			throw new Error(`PK parameters for model '${model}' not found`);
		}

		const [d, k1, k2, k3] = pkParams;

		const result = {
			model,
			description: modelInfo.description,
			doseUnits: modelInfo.units,
			pharmacokineticParameters: {
				d: { value: d, description: "Absorption delay parameter" },
				k1: { value: k1, description: "Absorption rate constant (1/hours)" },
				k2: { value: k2, description: "Distribution rate constant (1/hours)" },
				k3: { value: k3, description: "Elimination rate constant (1/hours)" },
			},
			...(includeUnits && {
				units: {
					current: unit,
					available: availableUnits,
					conversionFactor: availableUnits[unit].conversionFactor,
				},
			}),
		};

		return JSON.stringify(result, null, 2);
	},
};
