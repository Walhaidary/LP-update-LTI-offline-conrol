import React from 'react';

interface BreadcrumbProps {
  section: string;
}

export function Breadcrumb({ section }: BreadcrumbProps) {
  return (
    <div className="bg-[#F8F9FA] text-[#0088CC] px-6 py-2 flex items-center gap-2 text-sm">
      <a href="/" className="hover:underline">
        <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </a>
      <span className="text-[#999999]">›</span>
      <span className="text-[#999999]">{section}</span>
    </div>
  );
}