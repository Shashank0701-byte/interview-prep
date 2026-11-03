const { guardReply, CANNED_HINT } = require("../utils/coachGuard");

describe("guardReply", () => {
    test("replaces an example longer than eight lines", () => {
        const big = "```js\n" + Array.from({ length: 12 }, () => "x").join("\n") + "\n```";
        expect(guardReply("example", big)).toBe(CANNED_HINT);
    });

    test("keeps a short example", () => {
        expect(guardReply("example", "```js\nconst a = 1;\n```")).not.toBe(CANNED_HINT);
    });

    test("replaces an example with two code fences", () => {
        expect(guardReply("example", "```js\na\n```\n```js\nb\n```")).toBe(CANNED_HINT);
    });

    test("keeps a plain question", () => {
        expect(guardReply("socratic", "What did the last request return?")).toBe(
            "What did the last request return?"
        );
    });

    test("strips code from conceptual and review replies", () => {
        expect(guardReply("conceptual", "```js\n1\n```")).toBe(CANNED_HINT);
        expect(guardReply("review", "```js\n1\n```")).toBe(CANNED_HINT);
    });

    test("keeps directional text", () => {
        expect(guardReply("directional", "Look at createTask")).toBe("Look at createTask");
    });

    test("replaces an empty reply", () => {
        expect(guardReply("socratic", "   ")).toBe(CANNED_HINT);
    });
});
