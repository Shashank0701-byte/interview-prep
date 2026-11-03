const CANNED_HINT = "Try the failing test's input on paper. Look at the file that owns this behavior and trace that input through the function before you change it.";

const NO_CODE = new Set(["socratic", "directional", "conceptual", "review"]);

function guardReply(level, text) {
    const source = typeof text === "string" ? text.trim() : "";
    if (!source) return CANNED_HINT;
    const fences = source.match(/```[\s\S]*?```/g) || [];
    if (NO_CODE.has(level)) {
        if (fences.length > 0 || source.includes("```")) return CANNED_HINT;
        return source;
    }
    if (level === "example") {
        if (fences.length !== 1) return CANNED_HINT;
        const body = fences[0].replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
        if (body.split("\n").length > 8) return CANNED_HINT;
        return source;
    }
    return CANNED_HINT;
}

module.exports = { guardReply, CANNED_HINT };
