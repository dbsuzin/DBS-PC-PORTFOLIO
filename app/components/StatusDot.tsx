'use client';

import React from 'react';

interface StatusDotProps {
  lastSeen: string | Date;
  className?: string;
}

export default function StatusDot({ lastSeen, className = '' }: StatusDotProps) {
  const getStatus = () => {
    const now = new Date();
    const seen = new Date(lastSeen);
    const diffMs = now.getTime() - seen.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 24) return { color: 'bg-emerald-400', shadow: 'shadow-emerald-400/50', label: 'Online' };
    if (diffHours <= 168) return { color: 'bg-amber-400', shadow: 'shadow-amber-400/50', label: 'Stale' };
    return { color: 'bg-red-400', shadow: 'shadow-red-400/50', label: 'Offline' };
  };

  const status = getStatus();

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${status.color} shadow-lg ${status.shadow} ${className}`}
      title={status.label}
    />
  );
}
