'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCv } from '../model/useCv';
import { useCvActions } from '../model/useCvActions';
import type { CvFormValues, CvListItem } from '../types/CvTypes';

const MAX_LENGTH = 255;

type Field = keyof CvFormValues;

function FormSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-170 flex-col gap-8 pt-10" aria-hidden="true">
      <div className="bg-muted/40 h-12 animate-pulse" />
      <div className="bg-muted/40 h-12 animate-pulse" />
      <div className="bg-muted/40 h-36 animate-pulse" />
    </div>
  );
}

interface CvDetailsFormProps {
  cv: CvListItem;
  onChanged: () => Promise<unknown>;
}

function CvDetailsForm({ cv, onChanged }: CvDetailsFormProps) {
  const actions = useCvActions(onChanged);

  const [edits, setEdits] = useState<Partial<CvFormValues>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const values: CvFormValues = {
    name: edits.name ?? cv.name,
    education: edits.education ?? cv.education ?? '',
    description: edits.description ?? cv.description,
  };

  const errors: Record<Field, string | undefined> = {
    name: values.name.trim() ? undefined : 'Name is required',
    education: values.education.trim() ? undefined : 'Education is required',
    description: values.description.trim() ? undefined : 'Description is required',
  };

  const visibleError = (field: Field) => (edits[field] !== undefined ? errors[field] : undefined);

  const isDirty =
    values.name !== cv.name ||
    values.education !== (cv.education ?? '') ||
    values.description !== cv.description;
  const hasErrors = Boolean(errors.name || errors.education || errors.description);
  const canSubmit = isDirty && !hasErrors && !saving;

  const change = (field: Field) => (value: string) => {
    setEdits((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError('');
    try {
      await actions.update(cv.id, {
        name: values.name.trim(),
        education: values.education.trim(),
        description: values.description.trim(),
      });
      setEdits({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-220 flex-col gap-8 pt-10 pb-20"
    >
      <Input
        type="text"
        placeholder="Name"
        value={values.name}
        maxLength={MAX_LENGTH}
        invalid={Boolean(visibleError('name'))}
        helperText={visibleError('name')}
        onChange={(event) => change('name')(event.target.value)}
      />
      <Input
        type="text"
        placeholder="Education"
        value={values.education}
        maxLength={MAX_LENGTH}
        invalid={Boolean(visibleError('education'))}
        helperText={visibleError('education')}
        onChange={(event) => change('education')(event.target.value)}
      />
      <Textarea
        className="min-h-36"
        placeholder="Description"
        value={values.description}
        invalid={Boolean(visibleError('description'))}
        helperText={visibleError('description')}
        onChange={(event) => change('description')(event.target.value)}
      />

      {error ? <p className="text-primary text-sm">{error}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {saving ? 'Saving...' : 'Update'}
        </Button>
      </div>
    </form>
  );
}

export function CvDetailsPage() {
  const { cv, error, refetch } = useCv();

  if (error && !cv) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <p className="text-primary text-sm">Failed to load CV details</p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!cv) return <FormSkeleton />;

  return <CvDetailsForm key={cv.id} cv={cv} onChanged={refetch} />;
}
