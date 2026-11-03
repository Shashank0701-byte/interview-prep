import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuCode } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const CodingCatalog = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        axiosInstance
            .get(API_PATHS.CODING.LIST)
            .then((response) => {
                if (!cancelled) setTasks(response.data.tasks || []);
            })
            .catch(() => {
                if (!cancelled) setError("Could not load questions.");
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-cream dark:bg-navy py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_var(--color-shadow)] rounded-sm p-8 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 border-3 border-charcoal dark:border-cream/40 flex items-center justify-center">
                                <LuCode className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-wider text-charcoal dark:text-cream">
                                    AI-assisted coding
                                </h1>
                                <p className="mt-2 text-sm text-charcoal/70 dark:text-cream/70 max-w-2xl">
                                    Contest-style questions with constraints and samples. The statement stays on the left, the editor on the right. Open the assistant when you want code: it writes the procedure you describe, including when that procedure is wrong, and you drop the result into the editor before running the judge.
                                </p>
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-crimson font-semibold mb-4">{error}</p>}
                    <div className="grid gap-4">
                        {tasks.map((task) => (
                            <button
                                key={task.id}
                                type="button"
                                onClick={() => navigate(`/live-coding/${task.id}`)}
                                className="text-left bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm p-6 shadow-[4px_4px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 transition-transform"
                            >
                                <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-charcoal/60 dark:text-cream/60 mb-2">
                                    <span className="border-2 border-charcoal dark:border-cream/40 px-2 py-0.5 text-charcoal dark:text-cream">{task.difficulty}</span>
                                    <span>{task.minutes} min</span>
                                    <span>2000 credits</span>
                                </div>
                                <h2 className="text-xl font-display font-bold text-charcoal dark:text-cream">{task.title}</h2>
                                <p className="mt-2 text-sm text-charcoal/70 dark:text-cream/70">{task.summary}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CodingCatalog;
