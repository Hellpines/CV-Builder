'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { MultiSelect } from '@/components/ui/multi-select';
import { SelectField } from '@/components/ui/select-field';
import { Textarea } from '@/components/ui/textarea';
import { parseDate, toISODate } from '@/shared/lib/date';
import type { CvProjectFormValues, CvProjectPayload, ProjectInfo } from '../types/CvProjectTypes';

const EMPTY_VALUES: CvProjectFormValues = {
  projectId: '',
  startDate: '',
  endDate: '',
  roles: [],
  responsibilities: '',
};

type Field = 'project' | 'startDate' | 'endDate' | 'roles';

const splitLines = (text: string) =>
  text
    .split(' ')
    .map((line) => line.trim())
    .filter(Boolean);

const fingerprint = (values: CvProjectFormValues) =>
  JSON.stringify({
    start: values.startDate,
    end: values.endDate,
    roles: [...values.roles].sort(),
    responsibilities: splitLines(values.responsibilities),
  });

interface CvProjectFormProps {
  mode: 'add' | 'edit';
  projects: ProjectInfo[];
  roles: string[];
  initial: CvProjectFormValues;
  loading: boolean;
  error?: string;
  onSubmit: (payload: CvProjectPayload) => void;
  onCancel: () => void;
}

function CvProjectForm({
  mode,
  projects,
  roles,
  initial,
  loading,
  error,
  onSubmit,
  onCancel,
}: CvProjectFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<CvProjectFormValues>(initial);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    project: false,
    startDate: false,
    endDate: false,
    roles: false,
  });

  const project = projects.find((item) => item.id === values.projectId);
  const projectStart = parseDate(project?.start_date);
  const projectEnd = parseDate(project?.end_date);
  const start = parseDate(values.startDate);
  const end = parseDate(values.endDate);

  const isOutsideProject = (date: Date | null) =>
    Boolean(
      date &&
      ((projectStart && date.getTime() < projectStart.getTime()) ||
        (projectEnd && date.getTime() > projectEnd.getTime()))
    );

  const errors: Record<Field, string | undefined> = {
    project: values.projectId ? undefined : t('validation.projectRequired'),
    startDate: !values.startDate
      ? t('validation.startDateRequired')
      : isOutsideProject(start)
        ? t('validation.startDateOutOfRange')
        : undefined,
    endDate: !values.endDate
      ? undefined
      : isOutsideProject(end)
        ? t('validation.endDateOutOfRange')
        : start && end && end.getTime() < start.getTime()
          ? t('validation.endDateBeforeStart')
          : undefined,
    roles: values.roles.length ? undefined : t('validation.roleRequired'),
  };

  const hasValue: Record<Field, boolean> = {
    project: Boolean(values.projectId),
    startDate: Boolean(values.startDate),
    endDate: Boolean(values.endDate),
    roles: values.roles.length > 0,
  };
  const visibleError = (field: Field) =>
    touched[field] || hasValue[field] ? errors[field] : undefined;
  const touch = (field: Field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const selectProject = (id: string) => {
    const next = projects.find((item) => item.id === id);
    setValues((prev) => ({
      ...prev,
      projectId: id,
      startDate: toISODate(parseDate(next?.start_date)),
      endDate: toISODate(parseDate(next?.end_date)),
    }));
  };

  const roleOptions = Array.from(new Set([...roles, ...initial.roles])).map((role) => ({
    value: role,
    label: role,
  }));

  const isValid = !Object.values(errors).some(Boolean);
  const isDirty = fingerprint(values) !== fingerprint(initial);
  const canSubmit = isValid && (mode === 'add' || isDirty) && !loading;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setTouched({ project: true, startDate: true, endDate: true, roles: true });
        if (!canSubmit) return;
        onSubmit({
          projectId: values.projectId,
          start_date: values.startDate,
          end_date: values.endDate || null,
          roles: values.roles,
          responsibilities: splitLines(values.responsibilities),
        });
      }}
      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2"
    >
      <SelectField
        label={t('common.name')}
        placeholder={t('common.selectProject')}
        value={values.projectId}
        options={projects.map((item) => ({ value: item.id, label: item.name }))}
        disabled={mode === 'edit'}
        invalid={Boolean(visibleError('project'))}
        errorText={visibleError('project')}
        onChange={selectProject}
        onTouched={touch('project')}
      />
      <Input
        className="h-12 text-sm"
        placeholder={t('common.responsibilities')}
        disabled
        value={project?.domain ?? ''}
        readOnly
      />

      <DatePicker
        label={t('common.startDate')}
        value={values.startDate}
        minDate={project?.start_date}
        maxDate={project?.end_date}
        disabled={!project}
        invalid={Boolean(visibleError('startDate'))}
        helperText={visibleError('startDate')}
        onChange={(value) => setValues((prev) => ({ ...prev, startDate: value }))}
        onTouched={touch('startDate')}
      />
      <DatePicker
        label={t('common.endDate')}
        value={values.endDate}
        minDate={values.startDate || project?.start_date}
        maxDate={project?.end_date}
        disabled={!project}
        clearable
        invalid={Boolean(visibleError('endDate'))}
        helperText={visibleError('endDate')}
        onChange={(value) => setValues((prev) => ({ ...prev, endDate: value }))}
        onTouched={touch('endDate')}
      />

      <div className="sm:col-span-2">
        <Textarea
          className="min-h-28"
          placeholder={t('common.description')}
          value={project?.description ?? ''}
          disabled
          readOnly
        />
      </div>

      <div className="sm:col-span-2">
        <MultiSelect
          label={t('common.environment')}
          placeholder={t('common.environment')}
          options={(project?.environment ?? []).map((item) => ({ value: item, label: item }))}
          value={project?.environment ?? []}
          onValueChange={() => undefined}
          disabled
        />
      </div>

      <div className="sm:col-span-2">
        <MultiSelect
          label={t('common.roles')}
          placeholder={t('common.roles')}
          display="text"
          options={roleOptions}
          value={values.roles}
          invalid={Boolean(visibleError('roles'))}
          helperText={visibleError('roles')}
          onValueChange={(next) => {
            setValues((prev) => ({ ...prev, roles: next }));
            touch('roles')();
          }}
        />
      </div>

      <div className="sm:col-span-2">
        <Input
          placeholder={t('common.responsibilities')}
          value={values.responsibilities}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, responsibilities: event.target.value }))
          }
        />
        <p className="text-primary-foreground ml-2 text-sm">
          {t('common.oneResponsibilityPerSpace')}
        </p>
      </div>

      {error ? <p className="text-primary text-sm sm:col-span-2">{error}</p> : null}

      <div className="flex justify-end gap-4 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {loading
            ? t('common.saving')
            : mode === 'add'
              ? t('cv.projectCreate')
              : t('common.update')}
        </Button>
      </div>
    </form>
  );
}

interface CvProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  projects: ProjectInfo[];
  roles: string[];
  initial?: CvProjectFormValues;
  loading: boolean;
  error?: string;
  onSubmit: (payload: CvProjectPayload) => void;
}

export function CvProjectModal({
  open,
  onOpenChange,
  mode,
  projects,
  roles,
  initial = EMPTY_VALUES,
  loading,
  error,
  onSubmit,
}: CvProjectModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'add' ? t('cv.projectCreate') : t('cv.projectUpdate')}
      className="w-215 overflow-y-auto"
    >
      <CvProjectForm
        mode={mode}
        projects={projects}
        roles={roles}
        initial={initial}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </Modal>
  );
}
