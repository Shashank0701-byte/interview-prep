const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { spawn, execFileSync } = require("child_process");
const { same } = require("./codingSandbox");

const ECJ_URL = "https://repo1.maven.org/maven2/org/eclipse/jdt/ecj/3.16.0/ecj-3.16.0.jar";
const JUDGE_HEADER = `#pragma once
#include <string>
#include <vector>

struct Operation {
    std::string type;
    long long id;
    long long note;
    bool hasNote;
};

struct JudgeLong {
    bool present;
    long long value;
};
`;

let pythonBinary = "";
let gppBinary = "";
let javaBinary = "";
let javacBinary = "";

function childEnv(extraPath) {
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
        if (/KEY|SECRET|TOKEN|PASSWORD|MONGO|GEMINI|BREVO|DATABASE|URI/i.test(key)) delete env[key];
    }
    if (extraPath) env.PATH = `${extraPath}${path.delimiter}${env.PATH || ""}`;
    return env;
}

function runProcess(cmd, args, { cwd, timeoutMs, extraPath }) {
    return new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        let settled = false;
        const child = spawn(cmd, args, {
            cwd,
            env: childEnv(extraPath),
            windowsHide: true,
        });
        const finish = (code) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({ code, stdout, stderr });
        };
        const timer = setTimeout(() => {
            child.kill();
            stderr += "\nTimed out";
            finish(-1);
        }, timeoutMs);
        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
            if (stdout.length > 400000) child.kill();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
            if (stderr.length > 400000) child.kill();
        });
        child.on("error", (error) => {
            stderr += error.message;
            finish(-1);
        });
        child.on("close", (code) => finish(code == null ? -1 : code));
    });
}

function whereAll(name) {
    try {
        const command = process.platform === "win32" ? "where.exe" : "which";
        const args = process.platform === "win32" ? [name] : ["-a", name];
        return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    } catch (error) {
        return [];
    }
}

function resolvePython() {
    if (pythonBinary) return pythonBinary;
    const candidates = process.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];
    for (const candidate of candidates) {
        const found = whereAll(candidate);
        if (found.length) {
            pythonBinary = found[0];
            return pythonBinary;
        }
    }
    throw new Error("Python is not installed on the server");
}

function compilerMajor(binary) {
    try {
        const out = execFileSync(binary, ["--version"], { encoding: "utf8" });
        const match = out.match(/\)\s+(\d+)\.\d+/);
        return match ? Number(match[1]) : 0;
    } catch (error) {
        return 0;
    }
}

function resolveGpp() {
    if (gppBinary) return gppBinary;
    const found = whereAll("g++");
    if (!found.length) throw new Error("g++ is not installed on the server");
    found.sort((left, right) => compilerMajor(right) - compilerMajor(left));
    gppBinary = found[0];
    return gppBinary;
}

function resolveJava() {
    if (javaBinary) return javaBinary;
    const found = whereAll("java");
    if (!found.length) throw new Error("Java is not installed on the server");
    javaBinary = found[0];
    return javaBinary;
}

function resolveJavac() {
    if (javacBinary) return javacBinary;
    if (process.env.JAVA_HOME) {
        const bundled = path.join(process.env.JAVA_HOME, "bin", process.platform === "win32" ? "javac.exe" : "javac");
        if (fs.existsSync(bundled)) {
            javacBinary = bundled;
            return javacBinary;
        }
    }
    const found = whereAll("javac");
    javacBinary = found[0] || "";
    return javacBinary;
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                download(response.headers.location, dest).then(resolve, reject);
                return;
            }
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`Could not download the Java compiler (${response.statusCode})`));
                return;
            }
            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on("finish", () => file.close(resolve));
            file.on("error", reject);
        });
        request.on("error", reject);
    });
}

async function ensureEcj() {
    const dir = path.join(__dirname, "..", ".cache");
    const jar = path.join(dir, "ecj-3.16.0.jar");
    if (!fs.existsSync(jar)) {
        fs.mkdirSync(dir, { recursive: true });
        await download(ECJ_URL, jar);
    }
    return jar;
}

function clipError(text) {
    return String(text || "The program failed").trim().slice(0, 4000);
}

function blankResults(tests, message) {
    return tests.map((test) => ({
        id: test.id,
        name: test.name,
        visibility: test.visibility,
        passed: false,
        actual: null,
        expected: test.expect,
        error: message,
    }));
}

function grade(tests, outcomes) {
    const byId = new Map();
    for (const outcome of outcomes) {
        if (outcome && outcome.id) byId.set(outcome.id, outcome);
    }
    return tests.map((test) => {
        const outcome = byId.get(test.id);
        if (!outcome) {
            return {
                id: test.id,
                name: test.name,
                visibility: test.visibility,
                passed: false,
                actual: null,
                expected: test.expect,
                error: "No result",
            };
        }
        if (outcome.error) {
            return {
                id: test.id,
                name: test.name,
                visibility: test.visibility,
                passed: false,
                actual: null,
                expected: test.expect,
                error: String(outcome.error).slice(0, 2000),
            };
        }
        return {
            id: test.id,
            name: test.name,
            visibility: test.visibility,
            passed: same(outcome.actual, test.expect),
            actual: outcome.actual,
            expected: test.expect,
            error: null,
        };
    });
}

function parseJudge(stdout) {
    const outcomes = [];
    for (const line of String(stdout || "").split(/\r?\n/)) {
        if (!line.startsWith("__JUDGE__ ")) continue;
        try {
            outcomes.push(JSON.parse(line.slice("__JUDGE__ ".length)));
        } catch (error) {
            outcomes.push({ error: "The judge could not read the program output" });
        }
    }
    return outcomes;
}

function integerList(values) {
    return values.map((value) => {
        if (!Number.isSafeInteger(value)) throw new Error("A test argument is not an integer");
        return String(value);
    });
}

function javaIntArray(values) {
    return `new int[]{${integerList(values).join(",")}}`;
}

function javaIntMatrix(rows) {
    if (!rows.length) return "new int[0][]";
    return `new int[][]{${rows.map((row) => javaIntArray(row)).join(",")}}`;
}

function javaCall(fn, args) {
    if (fn === "mergeWindows") return `solution.mergeWindows(${javaIntMatrix(args[0])})`;
    if (fn === "holdWater") return `solution.holdWater(${javaIntArray(args[0])})`;
    if (fn === "orderCues") return `solution.orderCues(${integerList([args[0]])[0]}, ${javaIntMatrix(args[1])})`;
    if (fn === "replay") {
        const rows = args[1].map((operation) => {
            if (operation[0] === "CHECK") return `new Object[]{"CHECK", Integer.valueOf(${integerList([operation[1]])[0]})}`;
            return `new Object[]{"FILE", Integer.valueOf(${integerList([operation[1]])[0]}), Integer.valueOf(${integerList([operation[2]])[0]})}`;
        });
        const body = rows.length ? `new Object[][]{${rows.join(",")}}` : "new Object[0][]";
        return `solution.replay(${integerList([args[0]])[0]}, ${body})`;
    }
    throw new Error(`No Java call for ${fn}`);
}

function cppIntVector(values) {
    return `std::vector<int>{${integerList(values).join(",")}}`;
}

function cppIntMatrix(rows) {
    if (!rows.length) return "std::vector<std::vector<int>>{}";
    return `std::vector<std::vector<int>>{${rows.map((row) => cppIntVector(row)).join(",")}}`;
}

function cppCall(fn, args) {
    if (fn === "mergeWindows") return `mergeWindows(${cppIntMatrix(args[0])})`;
    if (fn === "holdWater") return `holdWater(${cppIntVector(args[0])})`;
    if (fn === "orderCues") return `orderCues(${integerList([args[0]])[0]}, ${cppIntMatrix(args[1])})`;
    if (fn === "replay") {
        const rows = args[1].map((operation) => {
            if (operation[0] === "CHECK") {
                return `Operation{"CHECK", ${integerList([operation[1]])[0]}, 0, false}`;
            }
            return `Operation{"FILE", ${integerList([operation[1]])[0]}, ${integerList([operation[2]])[0]}, true}`;
        });
        return `replay(${integerList([args[0]])[0]}, std::vector<Operation>{${rows.join(",")}})`;
    }
    throw new Error(`No C++ call for ${fn}`);
}

function pythonHarness() {
    return `import importlib.util
import json
import sys

spec = importlib.util.spec_from_file_location("solution", "solution.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
tests = json.load(open("tests.json", encoding="utf-8"))
for test in tests:
    try:
        actual = None
        for step in test["steps"]:
            actual = getattr(module, step["fn"])(*step["args"])
        sys.stdout.write("__JUDGE__ " + json.dumps({"id": test["id"], "actual": actual}) + "\\n")
        sys.stdout.flush()
    except Exception as exc:
        sys.stdout.write("__JUDGE__ " + json.dumps({"id": test["id"], "error": str(exc)}) + "\\n")
        sys.stdout.flush()
`;
}

function cppHarness(tests) {
    const cases = tests.map((test) => {
        const step = test.steps[0];
        return `    try {
        std::cout << "__JUDGE__ {\\"id\\":\\"${test.id}\\",\\"actual\\":";
        printJson(${cppCall(step.fn, step.args)});
        std::cout << "}" << std::endl;
    } catch (const std::exception& ex) {
        std::cout << "__JUDGE__ {\\"id\\":\\"${test.id}\\",\\"error\\":";
        printQuoted(ex.what());
        std::cout << "}" << std::endl;
    } catch (...) {
        std::cout << "__JUDGE__ {\\"id\\":\\"${test.id}\\",\\"error\\":\\"The test crashed\\"}" << std::endl;
    }`;
    }).join("\n");
    return `#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
#include "judge_api.hpp"
#include "solution.cpp"

static void printQuoted(const std::string& text) {
    std::cout << '"';
    for (size_t i = 0; i < text.size(); i++) {
        char c = text[i];
        if (c == '\\\\' || c == '"') std::cout << '\\\\' << c;
        else if (c == '\\n') std::cout << "\\\\n";
        else if (c == '\\r') std::cout << "\\\\r";
        else std::cout << c;
    }
    std::cout << '"';
}

static void printJson(long long value) { std::cout << value; }

static void printJson(const std::vector<int>& values) {
    std::cout << "[";
    for (size_t i = 0; i < values.size(); i++) {
        if (i) std::cout << ",";
        std::cout << values[i];
    }
    std::cout << "]";
}

static void printJson(const std::vector<std::vector<int>>& rows) {
    std::cout << "[";
    for (size_t i = 0; i < rows.size(); i++) {
        if (i) std::cout << ",";
        printJson(rows[i]);
    }
    std::cout << "]";
}

static void printJson(const std::vector<JudgeLong>& values) {
    std::cout << "[";
    for (size_t i = 0; i < values.size(); i++) {
        if (i) std::cout << ",";
        if (!values[i].present) std::cout << "null";
        else std::cout << values[i].value;
    }
    std::cout << "]";
}

int main() {
${cases}
    return 0;
}
`;
}

function javaHarness(tests) {
    const cases = tests.map((test) => {
        const step = test.steps[0];
        return `        try {
            System.out.println("__JUDGE__ {\\"id\\":\\"${test.id}\\",\\"actual\\":" + toJson(${javaCall(step.fn, step.args)}) + "}");
        } catch (Throwable ex) {
            System.out.println("__JUDGE__ {\\"id\\":\\"${test.id}\\",\\"error\\":" + quote(String.valueOf(ex)) + "}");
        }`;
    }).join("\n");
    return `public class Harness {
    static String quote(String text) {
        StringBuilder out = new StringBuilder("\\"");
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '\\\\' || c == '"') out.append('\\\\').append(c);
            else if (c == '\\n') out.append("\\\\n");
            else if (c == '\\r') out.append("\\\\r");
            else out.append(c);
        }
        out.append('"');
        return out.toString();
    }

    static String toJson(Object value) {
        if (value == null) return "null";
        if (value instanceof String) return quote((String) value);
        if (value instanceof int[][]) {
            int[][] rows = (int[][]) value;
            StringBuilder out = new StringBuilder("[");
            for (int i = 0; i < rows.length; i++) {
                if (i > 0) out.append(',');
                out.append(toJson(rows[i]));
            }
            out.append(']');
            return out.toString();
        }
        if (value instanceof int[]) {
            int[] row = (int[]) value;
            StringBuilder out = new StringBuilder("[");
            for (int i = 0; i < row.length; i++) {
                if (i > 0) out.append(',');
                out.append(row[i]);
            }
            out.append(']');
            return out.toString();
        }
        if (value instanceof long[]) {
            long[] row = (long[]) value;
            StringBuilder out = new StringBuilder("[");
            for (int i = 0; i < row.length; i++) {
                if (i > 0) out.append(',');
                out.append(row[i]);
            }
            out.append(']');
            return out.toString();
        }
        if (value instanceof Object[]) {
            Object[] row = (Object[]) value;
            StringBuilder out = new StringBuilder("[");
            for (int i = 0; i < row.length; i++) {
                if (i > 0) out.append(',');
                out.append(toJson(row[i]));
            }
            out.append(']');
            return out.toString();
        }
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        throw new IllegalArgumentException("Cannot encode " + value.getClass().getName());
    }

    public static void main(String[] args) {
        Solution solution = new Solution();
${cases}
    }
}
`;
}

function finish(tests, result) {
    const outcomes = parseJudge(result.stdout);
    if (!outcomes.length && result.code !== 0) {
        const message = clipError(result.stderr || result.stdout);
        return { compileError: message, results: blankResults(tests, "Did not run") };
    }
    return { compileError: "", results: grade(tests, outcomes) };
}

async function runPython(dir, code, tests) {
    fs.writeFileSync(path.join(dir, "solution.py"), code);
    fs.writeFileSync(path.join(dir, "harness.py"), pythonHarness());
    fs.writeFileSync(path.join(dir, "tests.json"), JSON.stringify(tests.map((test) => ({
        id: test.id,
        steps: test.steps,
    }))));
    const result = await runProcess(resolvePython(), ["-I", "harness.py"], { cwd: dir, timeoutMs: 15000 });
    return finish(tests, result);
}

async function runCpp(dir, code, tests) {
    const gpp = resolveGpp();
    fs.writeFileSync(path.join(dir, "judge_api.hpp"), JUDGE_HEADER);
    fs.writeFileSync(path.join(dir, "solution.cpp"), code);
    fs.writeFileSync(path.join(dir, "harness.cpp"), cppHarness(tests));
    const exe = path.join(dir, process.platform === "win32" ? "prog.exe" : "prog");
    const compiled = await runProcess(gpp, ["-std=c++14", "-O2", "-o", exe, "harness.cpp"], {
        cwd: dir,
        timeoutMs: 20000,
    });
    if (compiled.code !== 0) {
        const message = clipError(compiled.stderr || compiled.stdout);
        return { compileError: message, results: blankResults(tests, "Did not compile") };
    }
    const result = await runProcess(exe, [], {
        cwd: dir,
        timeoutMs: 8000,
        extraPath: path.dirname(gpp),
    });
    return finish(tests, result);
}

async function runJava(dir, code, tests) {
    fs.writeFileSync(path.join(dir, "Solution.java"), code);
    fs.writeFileSync(path.join(dir, "Harness.java"), javaHarness(tests));
    const classes = path.join(dir, "classes");
    fs.mkdirSync(classes);
    const javac = resolveJavac();
    let compiled;
    if (javac) {
        compiled = await runProcess(javac, ["-d", classes, "Solution.java", "Harness.java"], { cwd: dir, timeoutMs: 20000 });
    } else {
        const jar = await ensureEcj();
        compiled = await runProcess(resolveJava(), ["-jar", jar, "-source", "1.8", "-target", "1.8", "-d", classes, "Solution.java", "Harness.java"], {
            cwd: dir,
            timeoutMs: 20000,
        });
    }
    if (compiled.code !== 0) {
        const message = clipError(compiled.stderr || compiled.stdout);
        return { compileError: message, results: blankResults(tests, "Did not compile") };
    }
    const result = await runProcess(resolveJava(), ["-cp", classes, "Harness"], { cwd: dir, timeoutMs: 8000 });
    return finish(tests, result);
}

async function runForeign(language, code, tests) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "judge-"));
    try {
        if (language === "python") return await runPython(dir, code, tests);
        if (language === "cpp") return await runCpp(dir, code, tests);
        if (language === "java") return await runJava(dir, code, tests);
        throw new Error("Unsupported language");
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

module.exports = { runForeign };
