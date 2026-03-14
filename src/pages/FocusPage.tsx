import { useParams, useNavigate } from 'react-router-dom';
import { useFocusStore } from '../stores/focusStore';

const DURATIONS = [15, 25, 45, 60, 90];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { sessionActive, remainingSeconds, sessionCompleted, startSession, endSession } = useFocusStore();

  if (sessionActive) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-mono font-bold text-white mb-8 tabular-nums">
            {formatTime(remainingSeconds)}
          </div>
          <p className="text-gray-500 mb-10 text-lg">Focus session in progress. Stay in the zone.</p>
          <button
            onClick={endSession}
            className="bg-red-700 hover:bg-red-600 text-white text-sm font-medium px-8 py-3 rounded-lg transition-colors"
          >
            End Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(articleId ? `/editor/${articleId}` : '/')} className="text-gray-400 hover:text-white text-sm">
          ← Back
        </button>
        <h1 className="text-lg font-semibold text-white">Focus Mode</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 py-12 text-center">
        {sessionCompleted && (
          <div className="mb-8 bg-green-800/40 border border-green-700 rounded-lg px-6 py-4">
            <p className="text-green-400 font-semibold">Session complete! Great work.</p>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">Start a Focus Session</h2>
        <p className="text-gray-400 mb-10 text-sm">
          The timer will enter fullscreen and keep the screen awake (where supported). Close other tabs to minimize distractions.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-10 w-full">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => startSession(d)}
              className="bg-gray-800 hover:bg-blue-700 border border-gray-700 hover:border-blue-500 text-white text-sm font-medium py-4 rounded-lg transition-colors"
            >
              {d} min
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-600 space-y-1 text-left w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="font-semibold text-gray-500 mb-2">Browser notes:</p>
          <p>• Fullscreen requires a user gesture (clicking Start)</p>
          <p>• Wake lock keeps screen on in supported browsers (Chrome/Edge)</p>
          <p>• Session state is not persisted across page reloads</p>
        </div>
      </div>
    </div>
  );
}
