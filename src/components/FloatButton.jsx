import React from 'react';
import { Plus } from 'lucide-react';

export default function FloatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-glow hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
}