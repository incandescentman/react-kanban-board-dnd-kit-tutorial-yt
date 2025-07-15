import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Target, Compass, ChevronRight } from 'lucide-react';

interface ValuesCardProps {
  onToggleBack: () => void;
}

function ValuesCard({ onToggleBack }: ValuesCardProps) {
  const [values, setValues] = useState(() => {
    const saved = localStorage.getItem('values-card');
    return saved || '';
  });

  // Auto-save values to localStorage
  useEffect(() => {
    localStorage.setItem('values-card', values);
  }, [values]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-8 py-16 bg-gray-50">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, #374151 1px, transparent 1px)`,
               backgroundSize: '32px 32px'
             }}
        />
      </div>

      {/* Header */}
      <div className="w-full max-w-5xl mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 bg-gray-900 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight" 
                style={{ fontFamily: 'Inter Tight, sans-serif' }}>
              Values & Principles
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1 w-12 bg-gray-900 rounded-full" />
              <span className="text-sm text-gray-600 font-medium">Foundation for Decision Making</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values Content */}
      <div className="w-full max-w-5xl flex-1 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <Compass className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">Core Values</span>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
            
            <Textarea
              value={values}
              onChange={(e) => setValues(e.target.value)}
              placeholder="Define the principles that guide your decisions and shape your character. What values are non-negotiable in your life and work?"
              className="min-h-[500px] resize-none border-none bg-transparent text-gray-800 placeholder-gray-400 focus:ring-0 focus:border-0 w-full text-base leading-relaxed p-0"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mt-8 relative z-10">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span>Auto-saved</span>
          </div>
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default ValuesCard;