'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { toneClass, type LevelTone } from '@/components/ui/level-bar';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface PickerOption {
  value: string;
  label: string;
  tone?: LevelTone;
  exists?: boolean;
}

function OptionLabel({ option }: { option: PickerOption }) {
  return (
    <>
      {option.tone ? (
        <span
          aria-hidden="true"
          className={cn('h-0.5 w-6 shrink-0 self-center bg-current', toneClass[option.tone])}
        />
      ) : null}
      <span className="truncate">{option.label}</span>
    </>
  );
}

interface PickerFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: PickerOption[];
  disabled?: boolean;
  requiredText: string;
  error?: string;
  onChange: (value: string) => void;
}

function PickerField({
  label,
  placeholder,
  value,
  options,
  disabled,
  requiredText,
  error,
  onChange,
}: PickerFieldProps) {
  const [touched, setTouched] = useState(false);
  const selected = options.find((option) => option.value === value);
  const message = !value && touched ? requiredText : error;

  return (
    <div className="flex flex-col">
      <label
        className={`text-primary-foreground ml-3 text-xs transition-opacity duration-200 ${
          selected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </label>
      <Select
        disabled={disabled}
        value={null}
        onValueChange={(next) => {
          if (!next) return;
          onChange(String(next) === String(value) ? '' : String(next));
        }}
        onOpenChange={(open) => {
          if (!open) setTouched(true);
        }}
      >
        <SelectTrigger
          className="h-12 w-full"
          aria-label={label}
          invalid={Boolean(message)}
          helperText={message}
        >
          <SelectValue
            className={
              disabled
                ? 'text-primary-foreground'
                : selected
                  ? 'text-primary-bold'
                  : message
                    ? 'text-primary'
                    : 'text-placeholder'
            }
          >
            {selected ? <OptionLabel option={selected} /> : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={
                option.value === value
                  ? 'bg-primary-foreground text-secondary data-highlighted:bg-primary-foreground data-highlighted:text-secondary'
                  : undefined
              }
            >
              <OptionLabel option={option} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface LevelFormProps {
  optionLabel: string;
  levelLabel: string;
  optionRequired: string;
  levelRequired: string;
  duplicateMessage: string;
  options: PickerOption[];
  levels: PickerOption[];
  initial?: { option: string; level: string };
  loading: boolean;
  error?: string;
  onSubmit: (option: string, level: string) => void;
  onCancel: () => void;
}

function LevelForm({
  optionLabel,
  levelLabel,
  optionRequired,
  levelRequired,
  duplicateMessage,
  options,
  levels,
  initial,
  loading,
  error,
  onSubmit,
  onCancel,
}: LevelFormProps) {
  const [isEdit] = useState(Boolean(initial));
  const [option, setOption] = useState(initial?.option ?? '');
  const [level, setLevel] = useState(initial?.level ?? '');

  const duplicate = !isEdit && Boolean(options.find((item) => item.value === option)?.exists);
  const canSubmit = Boolean(option && level) && !duplicate && !loading;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit(option, level);
      }}
      className="flex flex-col gap-8"
    >
      <PickerField
        label={optionLabel}
        placeholder={optionLabel}
        value={option}
        options={options}
        disabled={isEdit}
        requiredText={optionRequired}
        error={duplicate ? duplicateMessage : undefined}
        onChange={setOption}
      />
      <PickerField
        label={levelLabel}
        placeholder={levelLabel}
        value={level}
        options={levels}
        requiredText={levelRequired}
        onChange={setLevel}
      />

      {error ? <p className="text-primary text-sm">{error}</p> : null}

      <div className="flex justify-end gap-4">
        <Button variant="secondary" onClick={onCancel} className="w-40">
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit} className="w-40">
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
}

interface LevelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  optionLabel: string;
  levelLabel: string;
  optionRequired: string;
  levelRequired: string;
  duplicateMessage: string;
  options: PickerOption[];
  levels: PickerOption[];
  initial?: { option: string; level: string };
  loading: boolean;
  error?: string;
  onSubmit: (option: string, level: string) => void;
}

export function LevelModal({
  open,
  onOpenChange,
  title,
  optionLabel,
  levelLabel,
  optionRequired,
  levelRequired,
  duplicateMessage,
  options,
  levels,
  initial,
  loading,
  error,
  onSubmit,
}: LevelModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <LevelForm
        optionLabel={optionLabel}
        levelLabel={levelLabel}
        optionRequired={optionRequired}
        levelRequired={levelRequired}
        duplicateMessage={duplicateMessage}
        options={options}
        levels={levels}
        initial={initial}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </Modal>
  );
}
