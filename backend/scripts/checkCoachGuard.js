const { guardReply } = require("../utils/coachGuard");

function assert(condition, message) {
    if (!condition) {
        console.error(message);
        process.exit(1);
    }
}

const big = "```js\n" + Array.from({ length: 12 }, () => "x").join("\n") + "\n```";
assert(!guardReply("example", big).includes("```"), "long example should be replaced");
assert(guardReply("socratic", "What did the last request return?") === "What did the last request return?", "plain question should pass");
assert(guardReply("conceptual", "```js\n1\n```").includes("paper"), "conceptual code should be replaced");
assert(guardReply("review", "```js\n1\n```").includes("paper"), "review code should be replaced");
assert(!guardReply("example", "```js\nconst a = 1;\n```").includes("paper"), "short example should pass");
assert(guardReply("example", "```js\na\n```\n```js\nb\n```").includes("paper"), "two fences should be replaced");
assert(guardReply("directional", "Look at createTask").includes("createTask") || guardReply("directional", "Look at createTask") === "Look at createTask", "directional text should pass");

require("../controllers/codingTaskController");
console.log("guard and controller ok");
