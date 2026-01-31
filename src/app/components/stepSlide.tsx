'use client'
import { Clock } from 'lucide-react';
import { RecipeInstructions } from '@/app/lib/types'

export default function StepSlide({ instruction, stepNumber, totalSteps } : { instruction: RecipeInstructions, stepNumber: number, totalSteps: number }) {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <div className="text-orange-400 text-lg font-medium mb-2">
          Step {stepNumber} of {totalSteps}
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      {instruction.action && (
        <div className="inline-block px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 font-medium mb-4">
          {instruction.action}
        </div>
      )}
      
      <h2 className="text-5xl font-bold mb-8 leading-tight">
        {instruction.action || `Step ${stepNumber}`}
      </h2>
      
      <p className="text-2xl leading-relaxed text-gray-200 mb-10">
        {instruction.text}
      </p>
      
      {(instruction.timer_hrs || instruction.timer_mins || instruction.timer_secs) && (
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-2 border-orange-500/50 rounded-2xl p-8 inline-block backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-orange-400" />
            <div className="text-sm font-medium text-orange-300 uppercase tracking-wide">Timer</div>
          </div>
          <div className="text-5xl font-bold text-orange-400">
            {instruction.timer_hrs && `${instruction.timer_hrs}h `}
            {instruction.timer_mins && `${instruction.timer_mins}m `}
            {instruction.timer_secs && `${instruction.timer_secs}s`}
          </div>
        </div>
      )}
    </div>
  );
}