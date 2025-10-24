'use client';

import React, { useState } from 'react';
import DesignStudioHeader from './DesignStudioHeader';
import ToolsPanel from './ToolsPanel';
import DesignCanvas from './DesignCanvas';
import PropertiesPanel from './PropertiesPanel';

export default function DesignStudio() {
  const [activeMenu, setActiveMenu] = useState<string>('home');

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <DesignStudioHeader />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <ToolsPanel activeMenu={activeMenu} onMenuSelect={setActiveMenu} />

        {/* Center - Canvas */}
        <DesignCanvas />

        {/* Right Sidebar - Properties */}
        <PropertiesPanel />
      </div>
    </div>
  );
}
