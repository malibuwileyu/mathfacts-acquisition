/**
 * Quiz Introduction Screen - Transition before quiz
 * Prepares student for quiz mode (silent - just visual)
 */

'use client';

interface FFQuizIntroProps {
  onNext: () => void;
}

export default function FFQuizIntro({ onNext }: FFQuizIntroProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="text-9xl mb-12">📝</div>
        
        <h2 className="text-7xl font-bold text-blue-600 mb-12">
          Quiz Time!
        </h2>
        
        <button
          onClick={onNext}
          className="bg-green-500 hover:bg-green-600 text-white text-3xl font-bold py-6 px-12 rounded-xl transition shadow-2xl"
        >
          Start Quiz →
        </button>
      </div>
    </div>
  );
}

