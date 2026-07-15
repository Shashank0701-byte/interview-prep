import React from "react";
import { LuX } from "react-icons/lu";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return <div
            className={`fixed top-[64px] right-0 z-40 h-[calc(100dvh-64px)] p-6 overflow-y-auto transition-all duration-300 w-full md:w-[40vw] border-l-4 ${
                isOpen ? "translate-x-0" : "translate-x-[110%]"
            }`}
            style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                boxShadow: `-8px 0px 0px 0px var(--color-shadow)`,
            }}
            tabIndex="-1"
            aria-labelledby="drawer-right-label"
        >
            <div className="flex items-center justify-between mb-8 pb-4 border-b-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-crimson animate-pulse rounded-full"></div>
                    <h5
                        id="drawer-right-label"
                        className="text-lg font-display font-bold uppercase tracking-wider"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {title}
                    </h5>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-sm border-2 transition-all hover:-translate-y-0.5 cursor-pointer"
                    style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                >
                    <LuX className="text-xl" strokeWidth={3} />
                </button>
                </div>

                <div className="text-sm font-body mb-6" style={{ color: 'var(--color-text)' }}>{children}</div>
        </div>
};

export default Drawer;