'use client';

import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { LevelBar, type LevelTone } from '@/components/ui/level-bar';
import { LevelModal, type PickerOption } from '@/components/ui/level-modal';

export interface LevelItem {
  key: string;
  label: string;
  level: string;
  progress: number;
  tone: LevelTone;
}

export interface LevelGroup {
  id: string;
  title?: string;
  items: LevelItem[];
}

export interface LevelsPanelLabels {
  add: string;
  remove: string;
  addTitle: string;
  editTitle: string;
  removeTitle: string;
  removeMessage: (count: number) => string;
  optionLabel: string;
  levelLabel: string;
  optionRequired: string;
  levelRequired: string;
  duplicate: string;
  empty: string;
}

interface LevelsPanelProps {
  groups: LevelGroup[];
  readOnly: boolean;
  options: PickerOption[];
  levels: PickerOption[];
  labels: LevelsPanelLabels;
  onAdd: (option: string, level: string) => Promise<void>;
  onUpdate: (key: string, level: string) => Promise<void>;
  onRemove: (keys: string[]) => Promise<void>;
}

type ModalState = { type: 'add' } | { type: 'edit'; item: LevelItem } | { type: 'confirm' } | null;

export function LevelsPanel({
  groups,
  readOnly,
  options,
  levels,
  labels,
  onAdd,
  onUpdate,
  onRemove,
}: LevelsPanelProps) {
  const { t } = useTranslation();
  const [modal, setModal] = useState<ModalState>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const closeModal = () => {
    setModal(null);
    setError('');
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelected([]);
  };

  const run = async (action: () => Promise<void>, onSuccess?: () => void) => {
    setPending(true);
    setError('');
    try {
      await action();
      onSuccess?.();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.somethingWentWrong'));
    } finally {
      setPending(false);
    }
  };

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );

  const handleItemClick = (item: LevelItem) => {
    if (selectionMode) toggle(item.key);
    else setModal({ type: 'edit', item });
  };

  const hasItems = groups.some((group) => group.items.length > 0);
  const editItem = modal?.type === 'edit' ? modal.item : undefined;

  return (
    <div className="flex flex-col">
      {hasItems ? (
        <div className="flex flex-col gap-8">
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section key={group.id}>
                {group.title ? (
                  <h2 className="text-foreground mb-4 text-sm">{group.title}</h2>
                ) : null}
                <ul className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => {
                    const isSelected = selected.includes(item.key);

                    return (
                      <li key={item.key}>
                        {readOnly ? (
                          <LevelBar label={item.label} progress={item.progress} tone={item.tone} />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleItemClick(item)}
                            aria-pressed={selectionMode ? isSelected : undefined}
                            aria-label={
                              selectionMode
                                ? `${t('common.select')} ${item.label}`
                                : `${t('common.update')} ${item.label}`
                            }
                            className={cn(
                              '-mx-3 flex w-70 cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-left transition-colors outline-none',
                              'hover:bg-primary-hover focus-visible:ring-primary focus-visible:ring-2'
                            )}
                          >
                            <LevelBar
                              label={item.label}
                              progress={item.progress}
                              tone={item.tone}
                            />
                            {isSelected ? (
                              <Check size={16} className="text-primary ml-auto shrink-0" />
                            ) : null}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
        </div>
      ) : (
        <p className="text-primary-foreground text-sm">{t(labels.empty)}</p>
      )}

      {!readOnly && (
        <>
          <div className="mt-12 flex flex-wrap items-center justify-end gap-4">
            {selectionMode ? (
              <>
                <Button
                  variant="secondary"
                  className="text-primary-foreground justify-center"
                  onClick={exitSelection}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant={selected.length ? 'primary' : 'primaryV2'}
                  className="flex items-center justify-center gap-2"
                  disabled={!selected.length}
                  onClick={() => setModal({ type: 'confirm' })}
                >
                  {!selected.length && <Trash2 size={20} />}
                  {selected.length ? (
                    <div className="flex gap-3">
                      <p>{t('common.delete')}</p>{' '}
                      <p className="bg-background text-primary rounded-full px-1.5">
                        {selected.length}
                      </p>
                    </div>
                  ) : (
                    t(labels.remove)
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-primary-foreground flex items-center justify-center gap-2"
                  onClick={() => setModal({ type: 'add' })}
                >
                  <Plus size={20} />
                  {t(labels.add)}
                </Button>
                <Button
                  variant="primaryV2"
                  className="flex items-center justify-center gap-2"
                  disabled={!hasItems}
                  onClick={() => setSelectionMode(true)}
                >
                  <Trash2 size={20} />
                  {t(labels.remove)}
                </Button>
              </>
            )}
          </div>

          <LevelModal
            open={modal?.type === 'add' || modal?.type === 'edit'}
            onOpenChange={(open) => {
              if (!open) closeModal();
            }}
            title={t(editItem ? labels.editTitle : labels.addTitle)}
            optionLabel={t(labels.optionLabel)}
            levelLabel={t(labels.levelLabel)}
            optionRequired={t(labels.optionRequired)}
            levelRequired={t(labels.levelRequired)}
            duplicateMessage={t(labels.duplicate)}
            options={editItem ? [{ value: editItem.key, label: editItem.label }] : options}
            levels={levels}
            initial={editItem ? { option: editItem.key, level: editItem.level } : undefined}
            loading={pending}
            error={error}
            onSubmit={(option, level) =>
              run(() => (editItem ? onUpdate(option, level) : onAdd(option, level)))
            }
          />

          <ConfirmModal
            open={modal?.type === 'confirm'}
            onOpenChange={(open) => {
              if (!open) closeModal();
            }}
            title={t(labels.removeTitle)}
            message={t(labels.removeMessage(selected.length))}
            loading={pending}
            error={error}
            onConfirm={() => run(() => onRemove(selected), exitSelection)}
          />
        </>
      )}
    </div>
  );
}
