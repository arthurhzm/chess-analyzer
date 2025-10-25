import { evaluationToPercentage, formatEvaluation } from '@/utils/chess-analysis';
import { useEffect, useState } from 'react';

interface EvaluationBarProps {
  evaluation: number;
  mate?: number;
}

export default function EvaluationBar({ evaluation, mate }: EvaluationBarProps) {
  const [percentage, setPercentage] = useState(50);
  const [displayValue, setDisplayValue] = useState('0.0');

  useEffect(() => {
    const newPercentage = evaluationToPercentage(evaluation, mate);
    setPercentage(newPercentage);
    setDisplayValue(formatEvaluation(evaluation, mate));
  }, [evaluation, mate]);

  // White advantage at bottom, black at top
  const whiteHeight = percentage;
  const blackHeight = 100 - percentage;

  return (
    <div className="flex flex-col h-full w-12 rounded-lg overflow-hidden shadow-lg border-2 border-border relative">
      {/* Black advantage (top) */}
      <div
        className="bg-gray-900 transition-all duration-500 ease-out flex items-start justify-center pt-2"
        style={{ height: `${blackHeight}%` }}
      >
        {blackHeight > 20 && (
          <span className="text-white text-xs font-bold transform rotate-180 writing-vertical">
            {evaluation < 0 ? displayValue.replace('-', '') : ''}
          </span>
        )}
      </div>

      {/* Evaluation display in the middle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-background border border-border rounded px-1.5 py-0.5 shadow-md z-10">
        <span className={`text-xs font-bold ${
          evaluation > 0 ? 'text-white' : evaluation < 0 ? 'text-gray-900' : 'text-muted-foreground'
        }`}>
          {displayValue}
        </span>
      </div>

      {/* White advantage (bottom) */}
      <div
        className="bg-gray-100 transition-all duration-500 ease-out flex items-end justify-center pb-2"
        style={{ height: `${whiteHeight}%` }}
      >
        {whiteHeight > 20 && (
          <span className="text-gray-900 text-xs font-bold writing-vertical">
            {evaluation > 0 ? displayValue : ''}
          </span>
        )}
      </div>
    </div>
  );
}
