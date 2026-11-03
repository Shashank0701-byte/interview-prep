const { GoogleGenerativeAI } = require("@google/generative-ai");
const CodingAttempt = require("../models/CodingAttempt");
const { getTask, listTasks } = require("../data/codingTasks");
const { runForeign } = require("../utils/languageRunner");
const { guardReply, CANNED_HINT } = require("../utils/coachGuard");

const COACH_LIMIT = 8;
const MAX_FILE_CHARS = 12000;
const HINT_LEVELS = new Set(["socratic", "directional", "conceptual", "example", "review"]);
const LEVEL_ORDER = ["socratic", "directional", "conceptual", "example", "review"];
const MODELS = ["models/gemini-flash-latest", "models/gemini-2.0-flash"];

const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function remainingCalls(coachCalls) {
    return Math.max(0, COACH_LIMIT - coachCalls);
}

function highestLevel(hints) {
    let best = -1;
    for (const hint of hints || []) {
        const index = LEVEL_ORDER.indexOf(hint.level);
        if (index > best) best = index;
    }
    return best < 0 ? null : LEVEL_ORDER[best];
}

function attemptView(attempt) {
    const coachCalls = attempt?.coachCalls || 0;
    const hints = attempt?.hints || [];
    return {
        files: attempt?.files?.length ? attempt.files : null,
        lastResult: attempt?.lastResult || null,
        coachCalls,
        remaining: remainingCalls(coachCalls),
        hints,
        highestLevel: highestLevel(hints),
        credits: attempt && attempt.credits != null ? attempt.credits : 2000,
        approaches: attempt?.approaches || [],
        messages: attempt?.messages || [],
    };
}

function sanitizeFiles(task, files) {
    if (!Array.isArray(files)) return null;
    const allowed = new Set(task.files.map((file) => file.path));
    const clean = [];
    for (const file of files) {
        if (!file || typeof file.path !== "string" || typeof file.code !== "string") return null;
        if (!allowed.has(file.path)) return null;
        if (file.code.length > MAX_FILE_CHARS) return null;
        clean.push({ path: file.path, code: file.code });
    }
    if (clean.length === 0 || clean.length > task.files.length) return null;
    return clean;
}

function clip(value, max) {
    if (typeof value !== "string") return "";
    return value.slice(0, max);
}

const listCodingTasks = async (_req, res) => {
    res.json({ tasks: listTasks() });
};

const getCodingTask = async (req, res) => {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ task });
};

const getCodingAttempt = async (req, res) => {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const attempt = await CodingAttempt.findOne({ user: req.user._id, taskId: task.id });
    res.json(attemptView(attempt));
};

const saveCodingAttempt = async (req, res) => {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const files = sanitizeFiles(task, req.body.files);
    if (!files) return res.status(400).json({ message: "Invalid files" });

    const lastResult = req.body.lastResult && typeof req.body.lastResult === "object"
        ? req.body.lastResult
        : null;

    const attempt = await CodingAttempt.findOneAndUpdate(
        { user: req.user._id, taskId: task.id },
        { $set: { files, lastResult }, $setOnInsert: { coachCalls: 0 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(attemptView(attempt));
};

function buildPrompt({ task, level, question, files, failingTest }) {
    const fileBlock = files.map((file) => `FILE ${file.path}\n${file.code}`).join("\n\n");
    const failure = failingTest
        ? `Failing test: ${failingTest.name}\n${failingTest.message}`
        : "No failing test was attached.";
    return `You are an interview coach sitting beside a candidate. Help them think. Do not hand over a solution, a finished function, or a patch of the codebase.

Hint level: ${level}
- socratic: ask one or two questions that help the candidate find the problem. No file names and no code.
- directional: name one file, function, or test. No code.
- conceptual: explain the idea or a debugging technique. No code.
- example: one fenced snippet of at most 8 lines that teaches an analogous pattern. Do not write the candidate's function.
- review: comment on the failing result and the current code. No code.

If the candidate asks you to fix the code, do not rewrite it. Stay at this hint level and ask what they observed.

Task: ${task.title}
${task.scenario || task.statement}

Objectives:
${(task.objectives || []).map((item) => `- ${item}`).join("\n")}

${task.statement}

${failure}

Candidate note: ${question || "(none)"}

Current files:
${fileBlock}`;
}

async function generateHint(prompt, maxOutputTokens, temperature = 0.4) {
    let lastError = null;
    for (const name of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: name,
                generationConfig: { maxOutputTokens, temperature },
            });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text && text.trim()) return text.trim();
        } catch (error) {
            lastError = error;
            console.error(`Coding coach model failed: ${name}`);
        }
    }
    if (lastError) console.error(lastError.message);
    return null;
}

const coachCodingTask = async (req, res) => {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const level = req.body.level;
    if (!HINT_LEVELS.has(level)) return res.status(400).json({ message: "Invalid hint level" });
    if (level === "review" && req.body.hasRun !== true) {
        return res.status(400).json({ message: "Run the tests before asking for a review" });
    }

    const files = sanitizeFiles(task, req.body.files);
    if (!files) return res.status(400).json({ message: "Invalid files" });

    const question = clip(req.body.question, 500);
    const failingTest = req.body.failingTest && typeof req.body.failingTest === "object"
        ? {
            name: clip(req.body.failingTest.name, 200),
            message: clip(req.body.failingTest.message, 500),
        }
        : null;

    if (!genAI) {
        return res.status(503).json({ message: "Coding coach is unavailable" });
    }

    try {
        await CodingAttempt.updateOne(
            { user: req.user._id, taskId: task.id },
            { $setOnInsert: { files, coachCalls: 0, lastResult: null } },
            { upsert: true }
        );
    } catch (error) {
        if (error.code !== 11000) throw error;
    }

    const attempt = await CodingAttempt.findOneAndUpdate(
        { user: req.user._id, taskId: task.id, coachCalls: { $lt: COACH_LIMIT } },
        { $inc: { coachCalls: 1 }, $push: { hints: { level, at: new Date() } } },
        { new: true }
    );

    if (!attempt) {
        return res.status(429).json({ message: "Hint limit reached for this task", remaining: 0 });
    }

    const maxOutputTokens = level === "example" ? 800 : 400;
    let raw = null;
    try {
        raw = await generateHint(
            buildPrompt({ task, level, question, files, failingTest }),
            maxOutputTokens
        );
    } catch (error) {
        console.error(error.message);
    }

    const reply = guardReply(level, raw || CANNED_HINT);
    res.json({
        reply,
        level,
        remaining: remainingCalls(attempt.coachCalls),
        highestLevel: highestLevel(attempt.hints),
    });
};

const GENERATION_COST = 300;
const STARTING_CREDITS = 2000;

function stripCode(text) {
    const fenced = String(text || "").match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
    return (fenced ? fenced[1] : String(text || "")).trim();
}

function approachReady(text) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length < 25) return false;
    return /array|map|stack|queue|heap|sort|pointer|window|graph|hash|loop|scan|evict|order|water|merge|capacity|node|edge|bfs|dfs|left|right|dynamic|recurse|interval|course|bar|cache/i.test(text);
}

function buildGenerationPrompt(task, approach) {
    return `You are the coding assistant in an assessment. Write JavaScript for solution.js.

Implement the candidate's approach as they described it. Do not switch to a different algorithm. Do not include the hidden tests. If their approach is incomplete, still follow it.

Return only the file. It must use CommonJS and module.exports. No explanation outside the code.

Problem:
${task.statement}

Candidate approach:
${approach}`;
}

const generateCodingTask = async (req, res) => {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const approach = clip(req.body.approach, 4000).trim();
    if (!approachReady(approach)) {
        return res.status(400).json({
            message: "Explain the data structure and the steps in a few sentences. A short prompt does not spend credits.",
        });
    }
    if (!genAI) return res.status(503).json({ message: "Code generation is unavailable" });

    try {
        await CodingAttempt.updateOne(
            { user: req.user._id, taskId: task.id },
            { $setOnInsert: { files: task.files, credits: STARTING_CREDITS, approaches: [], coachCalls: 0, lastResult: null } },
            { upsert: true }
        );
    } catch (error) {
        if (error.code !== 11000) throw error;
    }
    await CodingAttempt.updateOne(
        { user: req.user._id, taskId: task.id, credits: null },
        { $set: { credits: STARTING_CREDITS } }
    );

    const reserved = await CodingAttempt.findOneAndUpdate(
        { user: req.user._id, taskId: task.id, credits: { $gte: GENERATION_COST } },
        { $inc: { credits: -GENERATION_COST } },
        { new: true }
    );
    if (!reserved) {
        const current = await CodingAttempt.findOne({ user: req.user._id, taskId: task.id });
        return res.status(402).json({
            message: "Not enough credits to generate code",
            credits: current && current.credits != null ? current.credits : 0,
        });
    }

    let code = "";
    try {
        const raw = await generateHint(buildGenerationPrompt(task, approach), 2048);
        code = stripCode(raw);
        if (!code || !code.includes("module.exports")) {
            throw new Error("The model did not return a complete file");
        }
    } catch (error) {
        await CodingAttempt.updateOne({ _id: reserved._id }, { $inc: { credits: GENERATION_COST } });
        console.error(error.message);
        return res.status(503).json({
            message: "Could not generate code. Credits were not spent.",
            credits: reserved.credits + GENERATION_COST,
        });
    }

    const updated = await CodingAttempt.findOneAndUpdate(
        { _id: reserved._id },
        {
            $set: { files: [{ path: "solution.js", code }] },
            $push: { approaches: { text: approach, spent: GENERATION_COST, at: new Date() } },
        },
        { new: true }
    );

    res.json({
        code,
        path: "solution.js",
        spent: GENERATION_COST,
        credits: updated.credits,
        approaches: updated.approaches,
    });
};

const CHAT_CODE_COST = 300;
const NEED_APPROACH = "I will not write code from the problem statement. Describe your own procedure: the data structure, the order you scan, and what you do on each step. If that procedure is wrong, I will still code it that way.";

function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function describesProcedure(text) {
    return /\b(i|i'll|i'm|i've|i'd|my approach|i use|i keep|i sort|i scan|i loop|i store|i push|i pop|i check|i walk|i merge|i evict|then i|first i)\b/i.test(text);
}

function pastedStatement(statement, text) {
    const sample = text.toLowerCase().replace(/\s+/g, " ").trim();
    const source = String(statement || "").toLowerCase().replace(/\s+/g, " ");
    if (sample.length < 70) return false;
    for (let index = 0; index + 70 <= sample.length; index += 25) {
        if (source.includes(sample.slice(index, index + 70))) return true;
    }
    return false;
}

function extractCode(text) {
    const match = String(text || "").match(/```[a-zA-Z0-9+#]*\s*([\s\S]*?)```/);
    return match ? match[1].trim() : "";
}

function buildChatPrompt(task, language, history, message) {
    const label = { javascript: "JavaScript", python: "Python", cpp: "C++", java: "Java" }[language] || "JavaScript";
    const signature = (task.signatures && task.signatures[language]) || task.signatures?.javascript || "";
    const transcript = history
        .slice(-6)
        .map((entry) => `${entry.role === "user" ? "Candidate" : "Assistant"}: ${clip(entry.content, 1500)}`)
        .join("\n\n");
    return `You transcribe a candidate's approach into code. You are not a solver.

Hard rules:
- If the candidate pasted the problem, asked you to solve it, or did not give a concrete procedure, reply with one short request for their steps and do not include a code block.
- If they gave a procedure, implement that procedure exactly in ${label}, even when it is wrong, slow, or fails the samples.
- Do not replace their idea with a correct algorithm. Do not add steps they did not describe.
- Do not explain the right answer.
- When you write code, the reply is exactly one sentence, "This follows the approach you described.", then one fenced code block, and nothing after it.
- Keep the required names so the file can be dropped into the editor.

Required names:
${signature}

Conversation:
${transcript || "(none yet)"}

Latest message:
${message}`;
}

async function ensureAttempt(userId, task) {
    try {
        await CodingAttempt.updateOne(
            { user: userId, taskId: task.id },
            { $setOnInsert: { files: task.files, credits: STARTING_CREDITS, approaches: [], messages: [], coachCalls: 0, lastResult: null } },
            { upsert: true }
        );
    } catch (error) {
        if (error.code !== 11000) throw error;
    }
    await CodingAttempt.updateOne(
        { user: userId, taskId: task.id, credits: null },
        { $set: { credits: STARTING_CREDITS } }
    );
}

const chatCodingTask = async (req, res) => {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const language = ["javascript", "python", "cpp", "java"].includes(req.body.language) ? req.body.language : "javascript";
    const message = clip(req.body.message, 4000).trim();
    if (!message) return res.status(400).json({ message: "Write a message first" });

    await ensureAttempt(req.user._id, task);
    const existing = await CodingAttempt.findOne({ user: req.user._id, taskId: task.id });
    const prior = existing?.messages || [];
    const userEntry = { role: "user", content: message, code: "", language, at: new Date() };

    const pasted = pastedStatement(task.statement, message);
    const ready = wordCount(message) >= 18 && describesProcedure(message) && !(pasted && wordCount(message) < 80);
    if (!ready) {
        const messages = [...prior, userEntry, {
            role: "assistant",
            content: NEED_APPROACH,
            code: "",
            language,
            at: new Date(),
        }].slice(-40);
        const saved = await CodingAttempt.findOneAndUpdate(
            { user: req.user._id, taskId: task.id },
            { $set: { messages } },
            { new: true }
        );
        return res.json({
            reply: NEED_APPROACH,
            code: "",
            language,
            spent: 0,
            credits: saved.credits,
            messages: saved.messages,
        });
    }

    if (!genAI) return res.status(503).json({ message: "The assistant is unavailable" });

    const reserved = await CodingAttempt.findOneAndUpdate(
        { user: req.user._id, taskId: task.id, credits: { $gte: CHAT_CODE_COST } },
        { $inc: { credits: -CHAT_CODE_COST } },
        { new: true }
    );
    if (!reserved) {
        const current = await CodingAttempt.findOne({ user: req.user._id, taskId: task.id });
        return res.status(402).json({
            message: "Not enough credits to write code from an approach",
            credits: current && current.credits != null ? current.credits : 0,
        });
    }

    let reply = "";
    let code = "";
    try {
        reply = await generateHint(buildChatPrompt(task, language, prior, message), 2048, 0.2);
        if (!reply) throw new Error("The model returned an empty reply");
        code = extractCode(reply);
        if (language === "javascript" && code && !code.includes("module.exports")) {
            throw new Error("The model did not return a complete JavaScript file");
        }
    } catch (error) {
        await CodingAttempt.updateOne({ _id: reserved._id }, { $inc: { credits: CHAT_CODE_COST } });
        console.error(error.message);
        return res.status(503).json({
            message: "Could not write code. Credits were not spent.",
            credits: reserved.credits + CHAT_CODE_COST,
        });
    }

    let spent = CHAT_CODE_COST;
    if (!code) {
        spent = 40;
        await CodingAttempt.updateOne({ _id: reserved._id }, { $inc: { credits: CHAT_CODE_COST - 40 } });
    }

    const messages = [...(reserved.messages || []), userEntry, {
        role: "assistant",
        content: reply,
        code,
        language,
        at: new Date(),
    }].slice(-40);
    const updated = await CodingAttempt.findOneAndUpdate(
        { _id: reserved._id },
        {
            $set: { messages },
            $push: { approaches: { text: message, spent, at: new Date() } },
        },
        { new: true }
    );

    res.json({
        reply,
        code,
        language,
        spent,
        credits: updated.credits,
        messages: updated.messages,
    });
};

const runCodingTask = async (req, res) => {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    const language = req.body.language;
    if (!["python", "cpp", "java"].includes(language)) {
        return res.status(400).json({ message: "Unsupported language" });
    }
    const file = (task.files || []).find((item) => (task.languages || []).some((entry) => entry.id === language && entry.path === item.path));
    const code = clip(typeof req.body.code === "string" ? req.body.code : (file ? file.code : ""), 20000);
    try {
        const outcome = await runForeign(language, code, task.tests);
        res.json(outcome);
    } catch (error) {
        console.error(error.message);
        res.status(503).json({ message: error.message || "Could not run tests" });
    }
};

module.exports = {
    listCodingTasks,
    getCodingTask,
    getCodingAttempt,
    saveCodingAttempt,
    coachCodingTask,
    generateCodingTask,
    chatCodingTask,
    runCodingTask,
};
