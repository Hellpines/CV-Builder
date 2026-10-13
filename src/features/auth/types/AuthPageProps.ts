import { FormEvent, ReactNode } from 'react';

export type AuthPageProps = {
  title: string;
  subtitle: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitButton: ReactNode;
  footer?: ReactNode;
};
