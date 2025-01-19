import React, { useState } from 'react';
import { Check, ChevronRight, ChevronDown } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: Set<number>;
}

const STEPS = [
  {
    number: 1,
    title: 'Basic Information',
    description: 'Category, assignee, and priority'
  },
  {
    number: 2,
    title: 'Ticket Details',
    description: 'Title, description, and attachments'
  },
  {
    number: 3,
    title: 'Accountability',
    description: 'Accountability and status'
  }
];

export function WizardNavigation({ currentStep, onStepClick, completedSteps }: WizardNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav className={`bg-gray-50 rounded-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-3 flex items-center justify-between text-gray-600 hover:text-gray-900"
      >
        {!isCollapsed && <span className="text-sm font-medium">Navigation</span>}
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <div className={`space-y-2 p-3 ${isCollapsed ? 'hidden' : ''}`}>
        {STEPS.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = completedSteps.has(step.number);
          
          return (
            <button
              key={step.number}
              onClick={() => onStepClick(step.number)}
              className={`w-full text-left group relative p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : isCompleted
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full
                  ${isActive ? 'bg-white text-primary' : isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{step.number}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                </div>

                <ChevronRight className={`
                  w-4 h-4 flex-shrink-0 transition-transform
                  ${isActive ? 'text-white transform translate-x-1' : 'text-gray-400'}
                `} />
              </div>
            </button>
          );
        })}
      </div>

      {isCollapsed && (
        <div className="px-3 py-2 space-y-2">
          {STEPS.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = completedSteps.has(step.number);
            
            return (
              <button
                key={step.number}
                onClick={() => onStepClick(step.number)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : isCompleted
                    ? 'bg-white text-primary'
                    : 'bg-white text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.number}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}