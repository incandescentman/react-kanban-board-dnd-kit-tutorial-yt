import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface LegendProps {
  onMinimize: () => void;
}

function Legend({ onMinimize }: LegendProps) {
  return (
    <div className="w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Keyboard Shortcuts</h3>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onMinimize}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="border-b pb-2">
            <h4 className="font-medium mb-1">Navigation</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">⌘/Ctrl+1,2,3</span>
                <span>Switch tabs (Boards / If‑Then / Thought→Reframe)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">⌘⌥←/→ (Ctrl+Alt)</span>
                <span>Cycle tabs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">⌥K / ⌥L</span>
                <span>Cycle tabs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">⌥⇧K / ⌥⇧L</span>
                <span>Prev/Next board</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arrow Keys</span>
                <span>Navigate tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Space</span>
                <span>Toggle focus</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tab / ⇧Tab</span>
                <span>Focus first/last task (Boards)</span>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-2">
            <h4 className="font-medium mb-1">Task Actions</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">X or ⌘+D</span>
                <span>Toggle complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">⌘+Enter</span>
                <span>Add new task</span>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-2">
            <h4 className="font-medium mb-1">Drag & Drop</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Ctrl+Arrows</span>
                <span>Move focused task</span>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-2">
            <h4 className="font-medium mb-1">General</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">⌘+K</span>
                <span>Command palette</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">⌘+Z</span>
                <span>Undo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">⌘+Y</span>
                <span>Redo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">⌘+M</span>
                <span>Column move mode</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">?</span>
                <span>Toggle this legend</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">T</span>
                <span>Show tags</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Legend;
