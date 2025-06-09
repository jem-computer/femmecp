# femmecp Architecture Plan

*do androids dream of electric estradiol?*

An MCP server that wraps [estrannaise](https://github.com/jem-computer/estrannaise) - a simulator/calculator for feminizing hormone replacement therapy.

## Core Concept

femmecp provides an MCP interface to estrannaise's 3-compartment pharmacokinetic models for estradiol simulation, making complex hormone therapy calculations accessible to LLMs and other tools.

## Architecture Overview

### Tools (Actions)

#### `simulate_estradiol_levels`
- **Purpose**: Calculate estradiol concentration curves over time
- **Parameters**: 
  - `doses`: Array of dose amounts
  - `times`: Array of administration times
  - `models`: Array of estradiol ester types (EV, EEn, EC, etc.)
  - `days_range`: Time range for simulation
  - `units`: Output units for concentrations
  - `steady_state`: Whether to calculate steady-state levels
- **Returns**: Time series data of estradiol concentrations
- **Implementation**: Uses `e2multidose3C` for multi-dose calculations

#### `get_model_parameters`
- **Purpose**: Retrieve pharmacokinetic parameters for specific models
- **Parameters**:
  - `model_name`: Estradiol ester type
  - `include_uncertainty`: Whether to include MCMC uncertainty samples
- **Returns**: PK parameters (d, k1, k2, k3) with optional uncertainty data
- **Implementation**: Accesses `PKParameters` and `mcmcSamplesPK` data

#### `calculate_pharmacokinetics`
- **Purpose**: Calculate key PK metrics for a dosing scenario
- **Parameters**:
  - `model_name`: Estradiol ester type
  - `dose`: Dose amount
- **Returns**: Tmax, Cmax, half-life, and other PK metrics
- **Implementation**: Uses `getPKQuantities3C` function

#### `compare_dosing_regimens`
- **Purpose**: Compare multiple dosing regimens side-by-side
- **Parameters**:
  - `regimen_list`: Array of regimens (each with doses/times/models)
- **Returns**: Comparative analysis of regimens
- **Use case**: Optimization and treatment planning

#### `validate_dosing_safety` *(additional)*
- **Purpose**: Check dosing against known safe ranges
- **Parameters**:
  - `doses`: Dose amounts
  - `frequency`: Dosing frequency
  - `model_name`: Estradiol ester type
- **Returns**: Safety assessment with warnings/recommendations

### Resources (Reference Data)

#### `/models/{model_name}`
- **Content**: Individual model details, parameters, descriptions, units
- **Source**: Maps to `modelList` and `PKParameters` from estrannaise

#### `/presets`
- **Content**: Common dosing regimens from `presets.js`
- **Format**: Structured as reusable configurations

#### `/menstrual_cycle_data`
- **Content**: Reference curve with percentiles
- **Source**: `menstrualCycleData` splines from estrannaise

#### `/units` *(additional)*
- **Content**: Available unit conversions
- **Source**: `availableUnits` from estrannaise

### Prompts (LLM Guidance)

#### `analyze_regimen`
- **Input**: Natural language dosing schedule description
- **Purpose**: Guide LLM to parse user's regimen and run simulation
- **Output**: Structured analysis with safety considerations

#### `optimize_dosing`
- **Input**: Target levels, constraints, current regimen
- **Purpose**: Help find optimal dosing to reach target ranges
- **Features**: Uses steady-state calculations, considers safety limits

#### `explain_pharmacokinetics`
- **Input**: Model name or simulation results
- **Purpose**: Provide educational explanations of PK concepts
- **Content**: References 3-compartment model theory, clinical context

## Implementation Strategy

### Phase 1: Core Tools
1. Install estrannaise dependency
2. Implement `simulate_estradiol_levels` tool
3. Implement `get_model_parameters` tool
4. Add basic validation and error handling

### Phase 2: Resources & Additional Tools
1. Add model and preset resources
2. Implement `calculate_pharmacokinetics` tool
3. Implement `compare_dosing_regimens` tool
4. Add `validate_dosing_safety` tool

### Phase 3: Prompts & Polish
1. Implement analysis and optimization prompts
2. Add comprehensive documentation
3. Add unit conversion support
4. Enhance error handling and safety warnings

## Key Considerations

### Safety & Validation
- Robust input validation for medical calculations
- Clear warnings about simulation limitations
- Safety checks against known therapeutic ranges
- Proper medical disclaimers

### Scientific Rigor
- Preserve mathematical accuracy of estrannaise models
- Include uncertainty quantification via MCMC sampling
- Maintain proper units throughout calculations
- Document model assumptions and limitations

### Usability
- Clean, intuitive tool interfaces
- Helpful error messages for edge cases
- Comprehensive documentation
- Examples for common use cases

### Technical
- Keep complex mathematical functions (`e2Curve3C`, `e2SteadyState3C`) as internal utilities
- Structure responses to be compatible with plotting libraries
- Handle unit conversions seamlessly
- Optimize for performance with large time series

## Dependencies

- `estrannaise`: Core pharmacokinetic modeling library
- `fastmcp`: MCP server framework
- `zod`: Parameter validation and type safety

## Medical Disclaimer

This tool is for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.