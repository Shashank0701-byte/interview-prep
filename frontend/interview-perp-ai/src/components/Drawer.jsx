import React from "react";
import { LuX } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return <div
            className={`fixed top-[64px] right-0 z-40 h-[calc(100dvh-64px)] p-6 overflow-y-auto transition-transform bg-cream w-full md:w-[40vw] shadow-[-8px_0px_0px_0px_#1A1A1A] border-l-2 border-charcoal ${
                isOpen ? "translate-x-0" : "translate-x-[110%]"
            }`}
            tabIndex="-1"
            aria-labelledby="drawer-right-label"
        >
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-charcoal/20">
                <h5
                    id="drawer-right-label"
                    className="flex items-center text-xl font-display font-bold text-charcoal"
                >
                    {title}
                </h5>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-charcoal bg-transparent hover:bg-charcoal/10 rounded-md text-sm w-10 h-10 inline-flex items-center justify-center transition-colors"
                >
                    <LuX className="text-2xl"/>
                </button>
                </div>

                <div className="text-sm font-body text-charcoal mb-6">{children}</div>
        </div>
};

export default Drawer;