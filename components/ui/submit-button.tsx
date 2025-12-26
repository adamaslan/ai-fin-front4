'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function SubmitButton({ children, className = '' }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 ${className}`}
    >
      {pending ? 'Processing...' : children}
    </button>
  );
}
