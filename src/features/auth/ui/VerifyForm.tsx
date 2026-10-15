'use client';

import { Button } from '@/components/ui/button';
import { AuthPage } from './AuthPage';
import { useVerifyForm } from '../model/useVerifyForm';

export function VerifyForm() {
  const {
    code,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleLater,
    loading,
    hasError,
    helperText,
  } = useVerifyForm();

  return (
    <AuthPage
      title="Email verification"
      subtitle="Enter the verification code we sent to your email."
      onSubmit={handleSubmit}
      type="forgot"
      submitButton={
        <div className="flex w-full flex-col items-center space-y-4">
          <Button
            type="submit"
            variant="primary"
            className="w-40 py-4"
            disabled={loading || code.some((c) => !c)}
          >
            {loading ? 'CONFIRMING...' : 'CONFIRM'}
          </Button>
          <Button variant="ghost" onClick={handleLater} className="px-14 text-xs font-semibold">
            LATER
          </Button>
        </div>
      }
    >
      <div className="my-8 flex flex-col items-center">
        <div className="relative flex justify-center gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`text-primary-foreground border-muted h-12 w-12 border text-center text-xl font-semibold transition-all focus:ring-2 focus:outline-none ${
                hasError
                  ? 'border-border-error focus:ring-border-error'
                  : 'border-muted bg-background focus:ring-primary'
              }`}
            />
          ))}

          {helperText && (
            <p className="text-primary absolute -bottom-8 text-center text-sm font-medium">
              {helperText}
            </p>
          )}
        </div>
      </div>
    </AuthPage>
  );
}
