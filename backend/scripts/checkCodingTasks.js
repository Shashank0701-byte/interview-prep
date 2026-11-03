const { tasks } = require("../data/codingTasks");
const solutions = require("../data/codingSolutions");
const { runTests } = require("../utils/codingSandbox");

let failed = false;

for (const task of tasks) {
    const starter = runTests(task.files, task.tests);
    const starterPassed = starter.filter((test) => test.passed);
    if (starterPassed.length === starter.length) {
        console.error(`${task.id}: starter passed every test`);
        failed = true;
    } else {
        console.log(`${task.id}: starter fails ${starter.length - starterPassed.length}/${starter.length}`);
    }

    const solvedFiles = task.files.map((file) => {
        const replacement = solutions[task.id] && solutions[task.id][file.path];
        return replacement ? { path: file.path, code: replacement } : file;
    });
    const solved = runTests(solvedFiles, task.tests);
    const bad = solved.filter((test) => !test.passed);
    if (bad.length) {
        console.error(`${task.id}: solution failed`);
        for (const test of bad) {
            console.error(JSON.stringify({ name: test.name, actual: test.actual, expected: test.expected, error: test.error }, null, 2));
        }
        failed = true;
    } else {
        console.log(`${task.id}: solution passes ${solved.length}`);
    }
}

if (failed) process.exit(1);
