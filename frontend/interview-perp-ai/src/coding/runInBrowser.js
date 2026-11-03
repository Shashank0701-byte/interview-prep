const TEST_TIMEOUT_MS = 2000;

export function runTaskTests(files, tests, onUpdate) {
    const workers = [];
    let cancelled = false;

    const cancel = () => {
        cancelled = true;
        workers.forEach((worker) => worker.terminate());
    };

    const done = (async () => {
        const results = [];
        for (const test of tests) {
            if (cancelled) break;
            const result = await runOne(files, test, workers);
            results.push(result);
            if (onUpdate) onUpdate(results.slice());
        }
        return results;
    })();

    return { done, cancel };
}

function runOne(files, test, workers) {
    return new Promise((resolve) => {
        let worker;
        try {
            worker = new Worker(new URL("./codingTestRunner.js", import.meta.url), { type: "module" });
        } catch (error) {
            resolve(failed(test, error instanceof Error ? error.message : "Runner failed"));
            return;
        }
        workers.push(worker);
        const timer = setTimeout(() => {
            worker.terminate();
            resolve(failed(test, "Timed out after 2 seconds"));
        }, TEST_TIMEOUT_MS);
        worker.onmessage = (event) => {
            clearTimeout(timer);
            worker.terminate();
            resolve(event.data);
        };
        worker.onerror = (event) => {
            clearTimeout(timer);
            worker.terminate();
            resolve(failed(test, event.message || "Runner failed"));
        };
        worker.postMessage({ files, test });
    });
}

function failed(test, error) {
    return {
        id: test.id,
        name: test.name,
        visibility: test.visibility,
        passed: false,
        actual: null,
        expected: test.expect,
        error,
    };
}
