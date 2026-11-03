function resolvePath(fromFile, spec) {
    if (typeof spec !== "string" || !spec.startsWith(".")) {
        throw new Error("Only relative requires are allowed");
    }
    const base = fromFile.split("/").slice(0, -1);
    for (const part of spec.split("/")) {
        if (part === "" || part === ".") continue;
        if (part === "..") base.pop();
        else base.push(part);
    }
    let joined = base.join("/");
    if (!joined.endsWith(".js")) joined += ".js";
    return joined;
}

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === "object") {
        const out = {};
        for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
        return out;
    }
    return value;
}

function same(left, right) {
    return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

function createRequire(fileMap) {
    const cache = new Map();

    function requireFile(request) {
        if (cache.has(request)) return cache.get(request).exports;
        const code = fileMap.get(request);
        if (typeof code !== "string") {
            throw new Error(`Cannot find module '${request}'`);
        }
        const module = { exports: {} };
        cache.set(request, module);
        const runner = new Function(
            "require",
            "module",
            "exports",
            "fetch",
            "XMLHttpRequest",
            `${code}\n//# sourceURL=${request}`
        );
        const localRequire = (spec) => requireFile(resolvePath(request, spec));
        const disabledFetch = () => {
            throw new Error("Network is disabled");
        };
        runner(localRequire, module, module.exports, disabledFetch, undefined);
        return module.exports;
    }

    return requireFile;
}

export function runTests(files, tests) {
    const fileMap = new Map((files || []).map((file) => [file.path, file.code]));
    return (tests || []).map((test) => runOne(fileMap, test));
}

function runOne(fileMap, test) {
    const previousFetch = globalThis.fetch;
    globalThis.fetch = () => {
        throw new Error("Network is disabled");
    };
    try {
        const requireFile = createRequire(fileMap);
        const steps = test.steps || [];
        let actual;
        for (let index = 0; index < steps.length; index += 1) {
            const step = steps[index];
            const exported = requireFile(step.file);
            const fn = exported && exported[step.fn];
            if (typeof fn !== "function") {
                throw new Error(`${step.file} does not export ${step.fn}`);
            }
            actual = fn(...(step.args || []));
            if (index < steps.length - 1 && step.expect !== undefined && !same(actual, step.expect)) {
                return {
                    id: test.id,
                    name: test.name,
                    visibility: test.visibility,
                    passed: false,
                    actual,
                    expected: step.expect,
                    error: null,
                };
            }
        }
        const expected = test.expect;
        const passed = same(actual, expected);
        return {
            id: test.id,
            name: test.name,
            visibility: test.visibility,
            passed,
            actual,
            expected,
            error: null,
        };
    } catch (error) {
        return {
            id: test.id,
            name: test.name,
            visibility: test.visibility,
            passed: false,
            actual: null,
            expected: test.expect,
            error: error instanceof Error ? error.message : "Test failed",
        };
    } finally {
        globalThis.fetch = previousFetch;
    }
}
