import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Target, Compass, PauseCircle, Trophy, Brain, GraduationCap, Rocket, Heart, Users, Sun, Dumbbell, MessageCircle, Star, Hand } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col items-center px-6 py-8 bg-gradient-to-br from-slate-50 to-gray-100">
      
      {/* Header */}
      <div className="w-full max-w-4xl mb-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Inter Tight, sans-serif' }}>
              Urge vs. Values Pocket Card
            </h1>
          </div>
          <p className="text-gray-600 text-lg">A decision-making compass for moments of choice</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* Left Column - Pause & Questions */}
        <div className="space-y-6">
          
          {/* Pause Section */}
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Hand className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-red-700">Pause. Ask myself:</h2>
            </div>
            <p className="text-gray-600 italic mb-4">Before I break my structure...</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-300">
                <p className="text-sm font-medium text-gray-800 mb-1">1. What am I about to choose right now?</p>
                <p className="text-sm text-gray-600">Will it knock me off my structure or sleep schedule?</p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-300">
                <p className="text-sm font-medium text-gray-800 mb-1">2. What will I lose out on if I disrupt my structure?</p>
                <p className="text-sm text-gray-600">Which of my values am I sacrificing?</p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-300">
                <p className="text-sm font-medium text-gray-800 mb-1">3. What fleeting reward am I chasing in this moment?</p>
                <p className="text-sm text-gray-600">Is it just immediate gratification? Will it truly satisfy me? Will it derail me from what matters to me in the long term?</p>
              </div>
            </div>
          </div>

          {/* Prompts Section */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-700">Prompts to Self:</h2>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-800">"What am I about to lose by stepping out of my structure?"</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-800">"What would I gain by staying aligned instead?"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Values & Choice */}
        <div className="space-y-6">
          
          {/* Values at Stake */}
          <div className="bg-white rounded-xl border border-green-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-700">Values at Stake</h2>
            </div>
            <p className="text-gray-600 italic mb-4">What I stand to gain by staying on track:</p>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 p-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-800">Pride in myself</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-800">Achievements & accomplishments</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-800">Sharing my knowledge to help others</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <Rocket className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-800">Maximizing my potential and gifts</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-800">Social connection</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <Users className="h-4 w-4 text-indigo-500" />
                <span className="text-sm text-gray-800">Feeling close and emotionally connected</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <Sun className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-800">Mood stability & uplift</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <Dumbbell className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-800">Confidence in my body through exercise & nutrition</span>
              </div>
            </div>
          </div>

          {/* The Choice */}
          <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-purple-700 mb-4 text-center">THE CHOICE:</h2>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-2xl">😋</span>
                <p className="font-medium text-orange-700 mt-1">Immediate gratification</p>
                <p className="text-sm text-orange-600">(ultimately unsatisfying)</p>
              </div>
              
              <div className="text-center text-gray-500 font-medium">vs.</div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Star className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="font-medium text-purple-700">Meaningful action</p>
                <p className="text-sm text-purple-600">(consistent with the life I want)</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 italic mb-3">Instead of succumbing to a short-term urge... Am I willing to:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span>🙃</span>
                  <span>Inconvenience myself?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>💪</span>
                  <span>Make a hard decision?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🧍</span>
                  <span>Resist the urge to make an exception to my structure?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔄</span>
                  <span>Realign with my values for greater fulfillment?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🛑</span>
                  <span>Say no to an urge that will take me away from what I truly care about?</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Values Section */}
      <div className="w-full max-w-6xl mt-8 relative z-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Personal Values & Notes</h3>
          </div>
          <Textarea
            value={values}
            onChange={(e) => setValues(e.target.value)}
            placeholder="Add your personal values, principles, or customize the content above to make it your own..."
            className="min-h-[200px] resize-none border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 w-full text-sm leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mt-6 relative z-10">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Auto-saved</span>
        </div>
      </div>
    </div>
  );
}

export default ValuesCard;