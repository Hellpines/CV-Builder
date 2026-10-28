'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import type { CvFormValues } from '../types/CvTypes';

const EMPTY_VALUES: CvFormValues = { name: '', education: '', description: '' };
const MAX_LENGTH = 255;

type Field = keyof CvFormValues;

interface CvFormProps {
  mode: 'create' | 'edit';
  initial: CvFormValues;
  loading: boolean;
  error?: string;
  onSubmit: (values: CvFormValues) => void;
  onCancel: () => void;
}

function CvForm({ mode, initial, loading, error, onSubmit, onCancel }: CvFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<CvFormValues>(initial);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    education: false,
    description: false,
  });

  const errors: Record<Field, string | undefined> = {
    name: values.name.trim() ? undefined : t('validation.nameRequired'),
    education: values.education.trim() ? undefined : t('validation.educationRequired'),
    description: values.description.trim() ? undefined : t('validation.descriptionRequired'),
  };

  const visibleError = (field: Field) => (touched[field] ? errors[field] : undefined);
  const change = (field: Field) => (value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));
  const touch = (field: Field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const isValid = !errors.name && !errors.education && !errors.description;
  const canSubmit = isValid && !loading;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setTouched({ name: true, education: true, description: true });
        if (!canSubmit) return;
        onSubmit({
          name: values.name.trim(),
          education: values.education.trim(),
          description: values.description.trim(),
        });
      }}
      className="flex flex-col gap-8"
    >
      <Input
        type="text"
        placeholder={t('common.name')}
        value={values.name}
        maxLength={MAX_LENGTH}
        invalid={Boolean(visibleError('name'))}
        helperText={visibleError('name')}
        onChange={(event) => change('name')(event.target.value)}
        onBlur={touch('name')}
      />
      <Input
        type="text"
        placeholder={t('common.education')}
        value={values.education}
        maxLength={MAX_LENGTH}
        invalid={Boolean(visibleError('education'))}
        helperText={visibleError('education')}
        onChange={(event) => change('education')(event.target.value)}
        onBlur={touch('education')}
      />
      <Textarea
        placeholder={t('common.description')}
        value={values.description}
        invalid={Boolean(visibleError('description'))}
        helperText={visibleError('description')}
        onChange={(event) => change('description')(event.target.value)}
        onBlur={touch('description')}
      />

      {error ? <p className="text-primary text-sm">{error}</p> : null}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {loading ? t('common.saving') : mode === 'create' ? t('cv.create') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}

interface CvFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initial?: CvFormValues;
  loading: boolean;
  error?: string;
  onSubmit: (values: CvFormValues) => void;
}

export function CvFormModal({
  open,
  onOpenChange,
  mode,
  initial = EMPTY_VALUES,
  loading,
  error,
  onSubmit,
}: CvFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('cv.create') : t('cv.update')}
      className="max-w-lg"
    >
      <CvForm
        mode={mode}
        initial={initial}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </Modal>
  );
}
