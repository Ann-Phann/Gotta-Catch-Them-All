function normalizeFilterParam(param) {
    if (param === undefined) return [];
    return Array.isArray(param) ? param : [param];
}

function parseFiltersFromQuery(query) {
    return {
        level: normalizeFilterParam(query.level).map(Number),
        type: normalizeFilterParam(query.type),
        hpMin: query.minHp !== undefined ? parseInt(query.minHp) : undefined,
        hpMax: query.maxHp !== undefined ? parseInt(query.maxHp) : undefined,
        attackMin: query.minAtk !== undefined ? parseInt(query.minAtk) : undefined,
        attackMax: query.maxAtk !== undefined ? parseInt(query.maxAtk) : undefined
    };
}

module.exports = {
    parseFiltersFromQuery
};
