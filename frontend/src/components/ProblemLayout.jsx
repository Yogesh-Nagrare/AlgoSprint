import React from 'react';

const ProblemLayout = ({ 
    leftPanel, 
    rightPanel, 
    leftWidth, 
    startResizing, 
    isResizing 
}) => {
  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* MOBILE VIEW: Stacked (Scrollable) 
          DESKTOP VIEW: Left Panel with dynamic width */}
      <div 
        style={{ width: window.innerWidth > 768 ? `${leftWidth}%` : '100%' }}
        className="flex flex-col border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto md:overflow-hidden min-h-[40vh] md:min-h-0"
      >
        {leftPanel}
      </div>

      {/* DESKTOP ONLY: Resizer Bar */}
      <div 
        onMouseDown={startResizing}
        className="hidden md:flex w-1.5 h-full cursor-col-resize hover:bg-orange-500/30 transition-colors items-center justify-center shrink-0"
      >
        <div className={`w-[1px] h-10 bg-white/10 ${isResizing ? 'bg-orange-500 h-full' : ''}`} />
      </div>

      {/* RIGHT PANEL: Editor & Console 
          In mobile, this sits below the description */}
      <div 
        style={{ width: window.innerWidth > 768 ? `${100 - leftWidth}%` : '100%' }}
        className="flex flex-col flex-1 min-h-[60vh] md:min-h-0"
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ProblemLayout;