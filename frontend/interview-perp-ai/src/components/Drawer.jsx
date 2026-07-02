import React from "react";
import { LuX } from "react-icons/lu";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return <div
            className={`fixed top-[64px] right-0 z-40 h-[calc(100dvh-64px)] p-6 overflow-y-auto transition-all duration-300 w-full md:w-[40vw] border-l-2 ${
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
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2" style={{ borderColor: 'var(--color-border-muted)' }}>
                <h5
                    id="drawer-right-label"
                    className="flex items-center text-xl font-display font-bold"
                    style={{ color: 'var(--color-text)' }}
                >
                    {title}
                </h5>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md text-sm w-10 h-10 inline-flex items-center justify-center transition-colors"
                    style={{ color: 'var(--color-text)' }}
                >
                    <LuX className="text-2xl"/>
                </button>
                </div>

                <div className="text-sm font-body mb-6" style={{ color: 'var(--color-text)' }}>{children}</div>
        </div>
};

export default Drawer;