import React, { useState } from 'react';
import { LuCopy, LuCheck, LuCode } from "react-icons/lu";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AIResponsePreview = ({ content }) => {
    if (!content) return null;
    content = content.replace(/\\n/g, '\n');
    return (
        <div className='max-w-4xl mx-auto'>
            <div className='text-[14px] font-body text-charcoal dark:text-cream max-w-none prose prose-slate dark:prose-invert'>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            const isInLine = !className;

                            return !isInLine ? (
                                <CodeBlock
                                    code={String(children).replace(/\n$/, '')}
                                    language={language}
                                />
                            ) : (
                                <code className='px-1.5 py-0.5 bg-charcoal/10 dark:bg-cream/10 border-2 border-charcoal/20 dark:border-cream/20 rounded-sm font-bold font-mono text-charcoal dark:text-cream text-sm' {...props}>
                                    {children}
                                </code>
                            );
                        },
                        p({ children }) {
                            return <p className='mb-4 leading-6'>{children}</p>;
                        },
                        strong({ children }) {
                            return <strong className='font-bold text-charcoal dark:text-cream'>{children}</strong>;
                        },
                        em({ children }) {
                            return <em>{children}</em>;
                        },
                        ul({ children }) {
                            return <ul className='list-disc pl-6 space-y-2 my-4'>{children}</ul>;
                        },
                        ol({ children }) {
                            return <ol className='list-decimal pl-6 space-y-2 my-4'>{children}</ol>;
                        },
                        li({ children }) {
                            return <li className='mb-1'>{children}</li>;
                        },
                        blockquote({ children }) {
                            return <blockquote className='border-l-4 border-charcoal dark:border-cream/40 pl-4 italic my-4 text-charcoal/80 dark:text-cream/80 bg-cream/50 dark:bg-navy/50 py-2'>{children}</blockquote>;
                        },
                        h1({ children }) {
                            return <h1 className='text-2xl font-display font-bold mt-6 mb-4 text-charcoal dark:text-cream'>{children}</h1>;
                        },
                        h2({ children }) {
                            return <h2 className='text-xl font-display font-bold mt-6 mb-3 text-charcoal dark:text-cream'>{children}</h2>;
                        },
                        h3({ children }) {
                            return <h3 className='text-lg font-display font-bold mt-5 mb-2 text-charcoal dark:text-cream'>{children}</h3>;
                        },
                        h4({ children }) {
                            return <h4 className='text-base font-display font-bold mt-4 mb-2 text-charcoal dark:text-cream'>{children}</h4>;
                        },
                        a({ children, href }) {
                            return <a href={href} className='text-charcoal dark:text-cream font-bold underline decoration-2 underline-offset-2 hover:decoration-crimson transition-colors'>{children}</a>;
                        },
                        table({ children }) {
                            return (
                                <div className='overflow-x-auto my-4'>
                                    <table className='min-w-full divide-y-2 divide-charcoal/30 dark:divide-cream/30 border-2 border-charcoal dark:border-cream/40'>
                                        {children}
                                    </table>
                                </div>
                            );
                        },
                        thead({ children }) {
                            return <thead className='bg-cream dark:bg-navy'>{children}</thead>;
                        },
                        tbody({ children }) {
                            return <tbody className='divide-y-2 divide-charcoal/10 dark:divide-cream/10'>{children}</tbody>;
                        },
                        tr({ children }) {
                            return <tr>{children}</tr>;
                        },
                        th({ children }) {
                            return <th className='px-3 py-2 text-left text-xs font-bold font-mono text-charcoal dark:text-cream uppercase tracking-widest'>{children}</th>;
                        },
                        td({ children }) {
                            return <td className='px-3 py-2 whitespace-nowrap text-sm text-charcoal/80 dark:text-cream/80'>{children}</td>;
                        },
                        hr() {
                            return <hr className='my-6 border-t-2 border-charcoal/20 dark:border-cream/20' />;
                        },
                        img({ src, alt }) {
                            return <img src={src} alt={alt} className='my-4 max-w-full rounded-sm border-2 border-charcoal dark:border-cream/40' />;
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

function CodeBlock({ code, language }) {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(code);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='relative my-6 rounded-sm overflow-hidden bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 shadow-[6px_6px_0px_0px_var(--color-shadow)]'>
            <div className='flex items-center justify-between px-4 py-2.5 bg-charcoal dark:bg-[#0a1118] border-b-4 border-charcoal dark:border-cream/40'>
                <div className='flex items-center space-x-2'>
                    <LuCode size={14} className='text-cream/70' strokeWidth={3} />
                    <span className='text-xs font-bold font-mono text-cream/70 uppercase tracking-widest'>
                        {language || 'Code'}
                    </span>
                </div>
                <button
                    onClick={copyCode}
                    className='text-cream/60 hover:text-cream focus:outline-none relative group cursor-pointer transition-colors'
                    aria-label='Copy code'
                >
                    {copied ? (
                        <LuCheck size={14} className='text-green-400' strokeWidth={3} />
                    ) : (
                        <LuCopy size={14} strokeWidth={3} />
                    )}
                    {copied && (
                        <span className='absolute -top-8 right-0 bg-charcoal text-cream font-bold font-mono text-[10px] rounded-sm px-2 py-1 border border-cream/20 uppercase tracking-wider'>
                            Copied
                        </span>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={oneLight}
                customStyle={{ fontSize: 12.5, margin: 0, padding: '1rem', background: 'transparent' }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

export default AIResponsePreview;
