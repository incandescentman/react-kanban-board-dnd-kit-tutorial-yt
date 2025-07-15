import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Heart, Sparkles, Star, Compass } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col items-center px-8 py-12" style={{ background: 'white' }}>
      {/* Header */}
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
          Values Card
        </h1>
        <p className="text-center text-gray-600">
          Define your core values and principles that guide your decisions
        </p>
      </div>

      {/* Values Content */}
      <div className="w-full max-w-4xl flex-1">
        <Textarea
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="Write about your core values, principles, and what matters most to you..."
          className="min-h-[600px] resize-none border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 w-full text-base leading-relaxed p-6"
        />
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl mt-8 text-center">
        <p className="text-sm text-gray-500">
          Your values are automatically saved as you type
        </p>
      </div>
    </div>
  );
}

export default ValuesCard;