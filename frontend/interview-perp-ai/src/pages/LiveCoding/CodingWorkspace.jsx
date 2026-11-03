import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { LuArrowLeft } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useTheme } from "../../context/ThemeContext";
import { runTaskTests } from "../../coding/runInBrowser";

const GREETING = "I will not solve this from the statement. Pasting the question does not get you code. Describe your own procedure in the first person: the data structure, the order you scan, and what happens on each step. I will write that procedure in the language you have selected, even if the procedure is wrong. Then put it in the editor and run the judge.";

function showValue(value) {
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function summarize(results) {
    if (!results) return null;
    return {
        passedCount: results.filter((test) => test.passed).length,
        total: results.length,
        tests: results.map((test) => ({
            id: test.id,
            name: test.name,
            visibility: test.visibility,
            passed: test.passed,
            error: test.error,
            actual: showValue(test.actual).slice(0, 500),
            expected: showValue(test.expected).slice(0, 500),
        })),
    };
}

function splitFence(content) {
    const match = String(content || "").match(/```[a-zA-Z0-9+#]*\s*([\s\S]*?)```/);
    if (!match) return { prose: content || "", code: "" };
    const prose = `${content.slice(0, match.index)}${content.slice(match.index + match[0].length)}`.trim();
    return { prose, code: match[1].trim() };
}

const CodingWorkspace = () => {
    const { challengeId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [task, setTask] = useState(null);
    const [files, setFiles] = useState({});
    const [language, setLanguage] = useState("javascript");
    const [mode, setMode] = useState("problem");
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [credits, setCredits] = useState(2000);
    const [results, setResults] = useState(null);
    const [compileError, setCompileError] = useState("");
    const [running, setRunning] = useState(false);
    const [sending, setSending] = useState(false);
    const [missing, setMissing] = useState(false);
    const [saveState, setSaveState] = useState("");
    const loaded = useRef(false);
    const mounted = useRef(true);
    const runRef = useRef(null);
    const resultsRef = useRef(null);
    const threadRef = useRef(null);

    useEffect(() => {
        resultsRef.current = results;
    }, [results]);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            runRef.current?.cancel();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        loaded.current = false;
        setMissing(false);
        setTask(null);
        setMode("problem");
        Promise.all([
            axiosInstance.get(API_PATHS.CODING.GET(challengeId)),
            axiosInstance.get(API_PATHS.CODING.ATTEMPT(challengeId)),
        ])
            .then(([taskResponse, attemptResponse]) => {
                if (cancelled) return;
                const nextTask = taskResponse.data.task;
                const attempt = attemptResponse.data;
                const nextFiles = {};
                const judgeName = nextTask.tests?.[0]?.steps?.[0]?.fn || "";
                for (const file of nextTask.files || []) nextFiles[file.path] = file.code;
                for (const file of attempt.files || []) {
                    if (!(file.path in nextFiles)) continue;
                    if (file.path.endsWith(".js")) {
                        nextFiles[file.path] = file.code;
                        continue;
                    }
                    const matchesJudge = judgeName && file.code.includes(judgeName);
                    const staleCpp = file.path.endsWith(".cpp") && !file.code.includes("const std::") && !file.code.includes("judge_api.hpp");
                    const staleJava = file.path.endsWith(".java") && file.code.includes("List<int[]>");
                    const stalePython = file.path.endsWith(".py") && !file.code.includes(`def ${judgeName}`);
                    if (matchesJudge && !staleCpp && !staleJava && !stalePython) nextFiles[file.path] = file.code;
                }
                setTask(nextTask);
                setFiles(nextFiles);
                setLanguage("javascript");
                setResults(attempt.lastResult?.tests || null);
                setCredits(attempt.credits ?? 2000);
                setMessages(attempt.messages || []);
                loaded.current = true;
            })
            .catch((error) => {
                if (cancelled) return;
                if (error.response?.status === 404) setMissing(true);
                else toast.error("Could not open this question");
            });
        return () => {
            cancelled = true;
        };
    }, [challengeId]);

    useEffect(() => {
        if (!loaded.current || !task) return undefined;
        const payload = task.files.map((file) => ({ path: file.path, code: files[file.path] ?? "" }));
        const handle = setTimeout(() => {
            setSaveState("Saving…");
            axiosInstance
                .put(API_PATHS.CODING.ATTEMPT(task.id), {
                    files: payload,
                    lastResult: summarize(resultsRef.current),
                })
                .then(() => setSaveState("Saved"))
                .catch(() => setSaveState("Not saved"));
        }, 700);
        return () => clearTimeout(handle);
    }, [files, task]);

    useEffect(() => {
        const node = threadRef.current;
        if (node) node.scrollTop = node.scrollHeight;
    }, [messages, mode, sending]);

    const active = useMemo(
        () => (task?.languages || []).find((item) => item.id === language) || task?.languages?.[0],
        [task, language]
    );

    const passedCount = useMemo(
        () => (results || []).filter((test) => test.passed).length,
        [results]
    );

    const runTests = async () => {
        if (!task || running || !active) return;
        setRunning(true);
        setResults([]);
        setCompileError("");
        try {
            if (language === "javascript") {
                const run = runTaskTests(
                    [{ path: "solution.js", code: files["solution.js"] || "" }],
                    task.tests,
                    (partial) => setResults(partial.slice())
                );
                runRef.current = run;
                const next = await run.done;
                runRef.current = null;
                if (!mounted.current) return;
                setResults(next);
            } else {
                const response = await axiosInstance.post(API_PATHS.CODING.RUN(task.id), {
                    language,
                    code: files[active.path] || "",
                });
                if (!mounted.current) return;
                setResults(response.data.results || []);
                setCompileError(response.data.compileError || "");
            }
        } catch (error) {
            if (!mounted.current) return;
            setCompileError(error.response?.data?.message || "Could not run tests");
        } finally {
            if (mounted.current) setRunning(false);
        }
    };

    const send = async () => {
        const message = draft.trim();
        if (!task || sending || !message) return;
        const previous = messages;
        setDraft("");
        setSending(true);
        setMessages([...messages, { role: "user", content: message, code: "", language }]);
        try {
            const response = await axiosInstance.post(API_PATHS.CODING.CHAT(task.id), { message, language });
            if (!mounted.current) return;
            setMessages(response.data.messages || []);
            setCredits(response.data.credits);
        } catch (error) {
            if (!mounted.current) return;
            setMessages(previous);
            setDraft(message);
            if (error.response?.data?.credits != null) setCredits(error.response.data.credits);
            toast.error(error.response?.data?.message || "The assistant could not reply");
        } finally {
            if (mounted.current) setSending(false);
        }
    };

    const putInEditor = (entry) => {
        const parsed = splitFence(entry.content);
        const code = entry.code || parsed.code;
        const target = (task.languages || []).find((item) => item.id === (entry.language || language)) || active;
        if (!code || !target) return;
        setFiles((current) => ({ ...current, [target.path]: code }));
        setLanguage(target.id);
        setMode("problem");
        toast.success("Code is in the editor");
    };

    if (missing) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-cream dark:bg-navy p-8 text-charcoal dark:text-cream">
                    <p className="mb-4">This question is not available.</p>
                    <button type="button" onClick={() => navigate("/live-coding")} className="inline-flex items-center gap-2 border-2 border-charcoal dark:border-cream/40 px-3 py-2 text-xs uppercase tracking-wider font-bold">
                        <LuArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    if (!task || !active) {
        return (
            <DashboardLayout>
                <div className="min-h-screen grid place-items-center text-charcoal dark:text-cream">Loading question…</div>
            </DashboardLayout>
        );
    }

    const brief = task.brief;
    const solved = results && results.length === task.tests.length && passedCount === task.tests.length;

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem-4px)] flex flex-col overflow-hidden bg-cream dark:bg-navy text-charcoal dark:text-cream">
                <header className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b-4 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => navigate("/live-coding")}
                            className="inline-flex items-center gap-2 border-2 border-charcoal dark:border-cream/40 px-3 py-2 text-xs uppercase tracking-wider font-bold"
                        >
                            <LuArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                            Back
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-xl font-display font-bold uppercase tracking-wide truncate">{task.title}</h1>
                            <p className="text-[11px] font-mono uppercase tracking-wider opacity-70">
                                {task.difficulty} · {task.minutes} min · {task.limits}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMode(mode === "assistant" ? "problem" : "assistant")}
                            className="border-2 border-charcoal dark:border-cream/40 px-3 py-2 text-xs uppercase tracking-wider font-bold"
                        >
                            {mode === "assistant" ? "Question" : "Assistant"}
                        </button>
                        <span className="border-2 border-charcoal dark:border-cream/40 px-3 py-2 text-xs font-mono font-bold">{credits} credits</span>
                        <span className="text-xs font-mono opacity-70">{saveState}</span>
                        {mode === "problem" && (
                            <button
                                type="button"
                                onClick={runTests}
                                disabled={running}
                                className="bg-charcoal text-cream dark:bg-cream dark:text-navy px-4 py-2 text-xs uppercase tracking-wider font-bold disabled:opacity-50"
                            >
                                {running ? "Running…" : "Run tests"}
                            </button>
                        )}
                    </div>
                </header>

                {mode === "assistant" ? (
                    <section className="flex-1 min-h-0 flex flex-col">
                        <div className="shrink-0 flex flex-wrap gap-2 px-4 py-3 border-b border-charcoal/15 dark:border-cream/15 bg-white dark:bg-navy-light">
                            {(task.languages || []).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setLanguage(item.id)}
                                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border-2 ${
                                        item.id === language
                                            ? "bg-charcoal text-cream dark:bg-cream dark:text-navy border-charcoal dark:border-cream"
                                            : "border-charcoal/30 dark:border-cream/30"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div ref={threadRef} className="flex-1 min-h-0 overflow-auto px-4 py-4 space-y-4">
                            <article className="max-w-3xl border-2 border-charcoal/20 dark:border-cream/20 bg-white dark:bg-navy-light p-4 text-sm leading-relaxed">
                                {GREETING}
                            </article>
                            {messages.map((entry, index) => {
                                const parsed = splitFence(entry.content);
                                const code = entry.code || parsed.code;
                                const mine = entry.role === "user";
                                return (
                                    <article key={`${entry.at || index}-${index}`} className={`max-w-3xl ${mine ? "ml-auto" : ""}`}>
                                        <div className={`p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                                            mine
                                                ? "bg-charcoal text-cream dark:bg-cream dark:text-navy"
                                                : "bg-white dark:bg-navy-light border-2 border-charcoal/20 dark:border-cream/20"
                                        }`}
                                        >
                                            {mine ? entry.content : parsed.prose || entry.content}
                                        </div>
                                        {!mine && code && (
                                            <div className="mt-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy">
                                                <pre className="overflow-auto p-3 text-xs font-mono max-h-80">{code}</pre>
                                                <button
                                                    type="button"
                                                    onClick={() => putInEditor(entry)}
                                                    className="w-full bg-charcoal text-cream dark:bg-cream dark:text-navy px-3 py-2 text-xs uppercase tracking-wider font-bold"
                                                >
                                                    Put in editor
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                            {sending && <p className="text-xs font-mono uppercase tracking-wider opacity-70">Writing…</p>}
                        </div>
                        <form
                            className="shrink-0 border-t-4 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light p-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                send();
                            }}
                        >
                            <p className="text-[11px] font-mono uppercase tracking-wider opacity-60 mb-2">
                                Writing code spends 300 credits. A message without your own procedure is free. Selected language: {active.label}.
                            </p>
                            <div className="flex gap-2">
                                <textarea
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value.slice(0, 4000))}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                            event.preventDefault();
                                            send();
                                        }
                                    }}
                                    placeholder="I sort the windows by start, then I walk left to right and merge when the next start is not after the current end."
                                    className="flex-1 h-24 text-sm p-3 bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !draft.trim()}
                                    className="self-end bg-charcoal text-cream dark:bg-cream dark:text-navy px-4 py-3 text-xs uppercase tracking-wider font-bold disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </section>
                ) : (
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
                        <article className="overflow-auto border-b-4 lg:border-b-0 lg:border-r-4 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light px-5 py-5">
                            {brief ? (
                                <div className="space-y-5 text-sm leading-relaxed max-w-3xl">
                                    <p>{brief.story}</p>
                                    <section>
                                        <h2 className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Task</h2>
                                        <p>{brief.task}</p>
                                    </section>
                                    <section>
                                        <h2 className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Input</h2>
                                        <p className="whitespace-pre-wrap">{brief.input}</p>
                                    </section>
                                    <section>
                                        <h2 className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Output</h2>
                                        <p className="whitespace-pre-wrap">{brief.output}</p>
                                    </section>
                                    <section>
                                        <h2 className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Constraints</h2>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {brief.constraints.map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                        </ul>
                                    </section>
                                    {brief.samples.map((sample, index) => (
                                        <section key={sample.input} className="border-2 border-charcoal/15 dark:border-cream/15">
                                            <h2 className="text-[10px] font-mono uppercase tracking-widest opacity-60 px-3 pt-3">Sample {index + 1}</h2>
                                            <div className="grid md:grid-cols-2 gap-3 p-3">
                                                <div>
                                                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Input</p>
                                                    <pre className="text-xs font-mono whitespace-pre-wrap bg-cream dark:bg-navy p-2">{sample.input}</pre>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-1">Output</p>
                                                    <pre className="text-xs font-mono whitespace-pre-wrap bg-cream dark:bg-navy p-2">{sample.output || "(empty)"}</pre>
                                                </div>
                                            </div>
                                            <p className="px-3 pb-3 whitespace-pre-wrap">{sample.explanation}</p>
                                        </section>
                                    ))}
                                    <p className="text-xs font-mono opacity-70">{brief.note}</p>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{task.statement}</p>
                            )}
                        </article>

                        <section className="min-h-0 flex flex-col bg-white dark:bg-navy-light">
                            <div className="shrink-0 flex flex-wrap gap-2 px-3 py-2 border-b border-charcoal/15 dark:border-cream/15">
                                {(task.languages || []).map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setLanguage(item.id)}
                                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border-2 ${
                                            item.id === language
                                                ? "bg-charcoal text-cream dark:bg-cream dark:text-navy border-charcoal dark:border-cream"
                                                : "border-charcoal/30 dark:border-cream/30"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 min-h-[280px]">
                                <Editor
                                    key={active.path}
                                    height="100%"
                                    language={active.monaco}
                                    theme={isDarkMode ? "vs-dark" : "light"}
                                    value={files[active.path] || ""}
                                    onChange={(value) => setFiles((current) => ({ ...current, [active.path]: value ?? "" }))}
                                    options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true }}
                                />
                            </div>
                            <div className="h-56 shrink-0 overflow-auto border-t-4 border-charcoal dark:border-cream/40 p-3">
                                <p className="text-[10px] font-mono uppercase tracking-widest mb-2 opacity-60">
                                    Tests {results ? `${passedCount}/${results.length}` : ""}
                                    {solved ? " · all passed" : ""}
                                </p>
                                {compileError && (
                                    <pre className="mb-3 text-[11px] font-mono whitespace-pre-wrap text-crimson">{compileError}</pre>
                                )}
                                <ul className="space-y-2">
                                    {task.tests.map((test) => {
                                        const result = (results || []).find((item) => item.id === test.id);
                                        return (
                                            <li key={test.id} className="text-sm border-b border-charcoal/10 dark:border-cream/10 pb-2">
                                                <div className="flex justify-between gap-3">
                                                    <span>{test.name}</span>
                                                    <span className={`font-mono text-xs uppercase ${result && !result.passed ? "text-crimson" : ""}`}>
                                                        {result ? (result.passed ? "pass" : "fail") : test.visibility}
                                                    </span>
                                                </div>
                                                {result && !result.passed && (
                                                    <pre className="mt-1 text-[11px] font-mono whitespace-pre-wrap text-crimson">
                                                        {result.error
                                                            ? result.error
                                                            : `expected ${showValue(result.expected)}\nactual ${showValue(result.actual)}`}
                                                    </pre>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CodingWorkspace;
