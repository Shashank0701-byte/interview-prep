import React from 'react';

const FeedbackSection = ({ title, score, children }) => (
    <div className="mb-4">
        <div className="flex items-center justify-between">
            <h4 className="font-semibold text-md text-slate-700">{title}</h4>
            {score && <span className="font-bold text-slate-800">{score}/10</span>}
        </div>
        <p className="text-sm text-slate-600 mt-1">{children}</p>
    </div>
);

const FeedbackCard = ({ feedback }) => {
    if (!feedback) return null;

    return (
        <div className="mt-6 p-4 border rounded-lg bg-slate-50">
            <h3 className="text-lg font-bold mb-4 text-center">Feedback Report</h3>
            
            <FeedbackSection title="Content Accuracy" score={feedback.contentAccuracy.score}>
                {feedback.contentAccuracy.feedback}
            </FeedbackSection>
            
            <FeedbackSection title="Keyword Analysis">
                {feedback.keywordAnalysis.feedback}
            </FeedbackSection>

            <FeedbackSection title="Clarity & Conciseness" score={feedback.clarityConciseness.score}>
                {feedback.clarityConciseness.feedback}
            </FeedbackSection>

            <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-md text-slate-700">Suggested Improvement</h4>
                <p className="text-sm text-slate-600 mt-1">{feedback.suggestedImprovement}</p>
            </div>
        </div>
    );
};

export default FeedbackCard;
