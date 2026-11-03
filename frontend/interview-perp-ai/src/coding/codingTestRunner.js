import { runTests } from "./runTests.js";

self.fetch = () => Promise.reject(new Error("Network is disabled"));

self.onmessage = (event) => {
    const { files, test } = event.data;
    try {
        const [result] = runTests(files, [test]);
        self.postMessage(result);
    } catch (error) {
        self.postMessage({
            id: test?.id,
            name: test?.name,
            visibility: test?.visibility,
            passed: false,
            actual: null,
            expected: test?.expect,
            error: error instanceof Error ? error.message : "Test failed",
        });
    }
};
