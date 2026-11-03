const { tasks } = require("../data/codingTasks");
const solutions = require("../data/languageSolutions");
const { runForeign } = require("../utils/languageRunner");

let failed = false;

(async () => {
    for (const task of tasks) {
        const solved = solutions[task.id];
        for (const language of ["python", "cpp", "java"]) {
            const starter = task.files.find((file) => file.path.endsWith(language === "python" ? ".py" : language === "cpp" ? ".cpp" : ".java"));
            const starterRun = await runForeign(language, starter.code, task.tests);
            const starterPassed = starterRun.results.filter((test) => test.passed).length;
            if (starterRun.compileError) {
                console.error(`${task.id} ${language}: starter failed to compile`);
                console.error(starterRun.compileError);
                failed = true;
            } else if (starterPassed === task.tests.length) {
                console.error(`${task.id} ${language}: starter passed every test`);
                failed = true;
            } else {
                console.log(`${task.id} ${language}: starter fails ${task.tests.length - starterPassed}/${task.tests.length}`);
            }

            const solvedRun = await runForeign(language, solved[language], task.tests);
            const bad = solvedRun.results.filter((test) => !test.passed);
            if (solvedRun.compileError || bad.length) {
                console.error(`${task.id} ${language}: solution failed`);
                if (solvedRun.compileError) console.error(solvedRun.compileError);
                for (const test of bad) {
                    console.error(JSON.stringify({ name: test.name, actual: test.actual, expected: test.expected, error: test.error }));
                }
                failed = true;
            } else {
                console.log(`${task.id} ${language}: solution passes ${solvedRun.results.length}`);
            }
        }
    }
    if (failed) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
