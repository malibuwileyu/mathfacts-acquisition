/**
 * Number pad for kid-friendly input
 * Large touch targets for K-3 students
 * 
 * @spec BRAINLIFT.md - K-3 friendly UI
 * @spec CLIENT-REQUIREMENTS.md - Large buttons, number pad input
 */

'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
  maxValue?: number;
  hideDisplay?: boolean;
  disabled?: boolean;
}

export default function NumberPad({ value, onChange, maxValue = 20, hideDisplay = false, disabled = false }: Props) {
  const handleNumberClick = (num: number) => {
    if (disabled) return;
    const newValue = value + num.toString();
    if (parseInt(newValue) <= maxValue) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  const numbers = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Display - can be hidden when answer shows elsewhere */}
      {!hideDisplay && (
      <div className="bg-gray-100 rounded-lg p-3 mb-2 text-center">
        <div className="text-4xl font-bold text-gray-800 h-12 flex items-center justify-center">
          {value || '_'}
        </div>
      </div>
      )}

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {numbers.slice(0, 9).map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={disabled}
            className={`text-white text-3xl font-bold py-5 rounded-lg transition ${
              disabled 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Bottom row: 0 and Clear */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleNumberClick(0)}
          disabled={disabled}
          className={`text-white text-3xl font-bold py-5 rounded-lg transition ${
            disabled 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95'
          }`}
        >
          0
        </button>
        <button
          onClick={handleClear}
          disabled={disabled}
          className={`text-white text-xl font-bold py-5 rounded-lg transition ${
            disabled 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 active:bg-red-700 active:scale-95'
          }`}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

