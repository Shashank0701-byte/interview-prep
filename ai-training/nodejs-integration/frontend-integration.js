/**
 * Frontend Chat Integration (Updated & FIXED)
 */

const generateResponse = async (userMessage) => {
    try {
        setIsTyping(true);

        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userMessage,
                userId: userId || "anonymous",
                sessionId: Date.now().toString()
            })
        });

        const data = await response.json();

        return data.success ? data.message : "AI error — try again!";
    } catch (e) {
        console.error("Chat API error:", e);
        return "AI temporarily unavailable — try again soon!";
    } finally {
        setIsTyping(false);
    }
};

const checkAIServiceHealth = async () => {
    try {
        const response = await fetch("/api/ai/health");
        const health = await response.json();

        return health.success && health.pipelineReady;
    } catch (error) {
        console.error("Health check failed:", error);
        return false;
    }
};

useEffect(() => {
    checkAIServiceHealth().then((ok) => {
        console.log(ok ? "AI Ready ✔️" : "AI Offline ⚠️");
    });
}, []);
