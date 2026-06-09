/**
 * GRIMOIRE Spell Validator — Validates GDL spell definitions
 * @package grymoire-core
 */
const VALID_CATEGORIES = ['frontier', 'practical', 'code-review', 'ritual'];
const KEBAB_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
export function validateSpell(spell) {
    const errors = [];
    const warnings = [];
    // Required fields
    if (!spell.name)
        errors.push({ field: 'name', message: 'name is required' });
    else if (!KEBAB_REGEX.test(spell.name))
        errors.push({ field: 'name', message: 'name must be kebab-case' });
    if (!spell.version)
        errors.push({ field: 'version', message: 'version is required' });
    else if (!SEMVER_REGEX.test(spell.version))
        errors.push({ field: 'version', message: 'version must be semver (x.y.z)' });
    if (!spell.title)
        errors.push({ field: 'title', message: 'title is required' });
    if (!spell.author)
        errors.push({ field: 'author', message: 'author is required' });
    if (!spell.description)
        errors.push({ field: 'description', message: 'description is required' });
    // Category
    if (!spell.category)
        errors.push({ field: 'category', message: 'category is required' });
    else if (!VALID_CATEGORIES.includes(spell.category)) {
        errors.push({ field: 'category', message: `invalid category "${spell.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    // License
    if (!spell.license)
        errors.push({ field: 'license', message: 'license is required' });
    // Price
    if (spell.price !== undefined) {
        if (typeof spell.price !== 'number' || spell.price < 0 || !Number.isInteger(spell.price)) {
            errors.push({ field: 'price', message: 'price must be a non-negative integer (cents USD)' });
        }
    }
    // Inputs
    if (!spell.inputs || !Array.isArray(spell.inputs) || spell.inputs.length === 0) {
        errors.push({ field: 'inputs', message: 'inputs must be a non-empty array' });
    }
    else {
        spell.inputs.forEach((input, i) => {
            if (!input.name)
                errors.push({ field: `inputs[${i}].name`, message: 'input name is required' });
            if (!input.type)
                errors.push({ field: `inputs[${i}].type`, message: 'input type is required' });
            if (!input.description)
                errors.push({ field: `inputs[${i}].description`, message: 'input description is required' });
            if (input.min !== undefined && input.max !== undefined && input.min > input.max) {
                errors.push({ field: `inputs[${i}]`, message: `min (${input.min}) must be <= max (${input.max})` });
            }
        });
    }
    // Output
    if (!spell.output)
        errors.push({ field: 'output', message: 'output is required' });
    else {
        if (!spell.output.type)
            errors.push({ field: 'output.type', message: 'output type is required' });
        if (!spell.output.schema)
            warnings.push('output schema is recommended for documentation');
    }
    // Ritual
    if (!spell.ritual)
        errors.push({ field: 'ritual', message: 'ritual is required' });
    else if (!spell.ritual.steps || spell.ritual.steps.length === 0) {
        errors.push({ field: 'ritual.steps', message: 'ritual must have at least one step' });
    }
    else {
        spell.ritual.steps.forEach((step, i) => {
            if (!step.name)
                errors.push({ field: `ritual.steps[${i}].name`, message: 'step name is required' });
            if (!step.description)
                warnings.push(`ritual.steps[${i}]: description recommended for ${step.name || `step ${i}`}`);
        });
    }
    // Tags
    if (spell.tags && spell.tags.length === 0) {
        warnings.push('tags array is empty — consider adding tags for discoverability');
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
export function formatValidationErrors(result) {
    if (result.valid)
        return 'Spell is valid.';
    const lines = [];
    if (result.errors.length > 0) {
        lines.push(`ERRORS (${result.errors.length}):`);
        result.errors.forEach(e => lines.push(`  ✗ ${e.field}: ${e.message}`));
    }
    if (result.warnings.length > 0) {
        lines.push(`WARNINGS (${result.warnings.length}):`);
        result.warnings.forEach(w => lines.push(`  ⚠ ${w}`));
    }
    return lines.join('\n');
}
//# sourceMappingURL=spell-validator.js.map