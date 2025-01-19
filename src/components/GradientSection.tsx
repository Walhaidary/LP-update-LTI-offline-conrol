import React from 'react';

export function GradientSection() {
  return (
    <div className="flex-1 flex flex-col justify-center p-8 md:p-16 bg-gradient-to-b from-[#5BB7CD] to-[#4B92C4]">
      <blockquote className="max-w-lg">
        <p className="text-[2.5rem] font-light text-white leading-tight mb-8">
          "In every pallet packed and every mile traversed, you're not just moving goods—you're delivering hope, compassion, and a brighter tomorrow."
        </p>
        <footer className="text-white text-xl">
          - Wilhelm Hoffman
        </footer>
      </blockquote>
    </div>
  );
}