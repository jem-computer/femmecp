declare module "estrannaise/src/models.js" {
  export function e2multidose3C(
    t: number,
    doses?: number[],
    times?: number[],
    models?: string[],
    cf?: number,
    random?: boolean,
    intervals?: boolean
  ): number;

  export function e2Curve3C(
    t: number,
    dose: number,
    d: number,
    k1: number,
    k2: number,
    k3: number,
    Ds?: number,
    D2?: number,
    steadystate?: boolean,
    T?: number
  ): number;

  export function esSingleDose3C(
    t: number,
    dose: number,
    d: number,
    k1: number,
    k2: number,
    k3: number,
    Ds?: number
  ): number;

  export function e2SteadyState3C(
    t: number,
    dose: number,
    T: number,
    d: number,
    k1: number,
    k2: number,
    k3: number
  ): number;

  export function e2Patch3C(
    t: number,
    dose: number,
    d: number,
    k1: number,
    k2: number,
    k3: number,
    W: number,
    steadystate?: boolean,
    T?: number
  ): number;

  export function e2SteadyStatePatch3C(
    t: number,
    dose: number,
    T: number,
    d: number,
    k1: number,
    k2: number,
    k3: number,
    W: number
  ): number;

  export function e2ssAverage3C(
    dose: number,
    T: number,
    d: number,
    k1: number,
    k2: number,
    k3: number
  ): number;

  export function PKFunctions(conversionFactor?: number): Record<string, (...args: unknown[]) => number>;
  export function PKRandomFunctions(conversionFactor?: number): Record<string, (...args: unknown[]) => number>;

  export function randomMCMCSample(type: string, idx?: number | null): number[];
  export function terminalEliminationTime3C(
    d: number,
    k1: number,
    k2: number,
    k3: number,
    nbHalfLives?: number
  ): number;
  export function getPKQuantities3C(d: number, k1: number, k2: number, k3: number): object;
  export function getPKQuantities(model: string): object;

  export function fillMenstrualCycleCurve(
    xMin: number,
    xMax: number,
    nbSteps: number,
    conversionFactor?: number
  ): object;
  export function fillTargetRange(xMin: number, xMax: number, conversionFactor?: number): object;
  export function fillCurve(func: (...args: unknown[]) => number, xMin: number, xMax: number, nbSteps: number): object;

  export const modelList: Record<string, { units: string; description: string }>;
  export const PKParameters: Record<string, number[]>;
  export const availableUnits: Record<string, { units: string; conversionFactor: number; precision: number }>;
}

declare module "estrannaise/src/plotting.js" {
  export function wongPalette(n: number): string;
  export function generatePlottingOptions(options?: object): object;
  export function plotCurves(dataset: object, options?: object, returnSVG?: boolean): HTMLElement | string;
}

declare module "estrannaise/src/presets.js" {
  export const Presets: object;
}

declare module "estrannaise/src/modeldata.js" {
  export const menstrualCycleData: { t: number[]; E2: number[]; E2p5: number[]; E2p95: number[] };
  export const availableUnits: Record<string, { units: string; conversionFactor: number; precision: number }>;
  export const modelList: Record<string, { units: string; description: string }>;
  export const PKParameters: Record<string, number[]>;
  export let mcmcSamplesPK: object;
}

declare module "estrannaise/src/estrannaise.js" {
  export function getDataset(keepInvalid?: boolean, passColor?: boolean): object;
  export function getCurrentPlottingOptions(): object;
}

// Type definitions
declare module "estrannaise" {
  export type ModelName = 'EB im' | 'EV im' | 'EEn im' | 'EC im' | 'EUn im' | 'EUn casubq' | 'patch tw' | 'patch ow';
  export type UnitName = 'pg/mL' | 'pmol/L' | 'ng/L' | 'FFF';
}