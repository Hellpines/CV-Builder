import { createElement as h } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/level-modal', () => ({
  LevelModal: ({
    open,
    title,
    error,
    loading,
    onSubmit,
    onOpenChange,
  }: {
    open: boolean;
    title: string;
    error?: string;
    loading: boolean;
    onSubmit: (option: string, level: string) => void;
    onOpenChange: (open: boolean) => void;
  }) =>
    open
      ? h(
          'div',
          null,
          h('h2', null, title),
          error ? h('p', null, error) : null,
          h(
            'button',
            {
              type: 'button',
              disabled: loading,
              onClick: () => onSubmit('react', 'senior'),
            },
            'submit-level'
          ),
          h('button', { type: 'button', onClick: () => onOpenChange(false) }, 'close-level')
        )
      : null,
}));

vi.mock('@/components/ui/confirm-modal', () => ({
  ConfirmModal: ({
    open,
    title,
    message,
    error,
    loading,
    onConfirm,
    onOpenChange,
  }: {
    open: boolean;
    title: string;
    message: string;
    error?: string;
    loading: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
  }) =>
    open
      ? h(
          'div',
          null,
          h('h2', null, title),
          h('p', null, message),
          error ? h('p', null, error) : null,
          h('button', { type: 'button', disabled: loading, onClick: onConfirm }, 'confirm-remove'),
          h('button', { type: 'button', onClick: () => onOpenChange(false) }, 'close-confirm')
        )
      : null,
}));

import { LevelsPanel, type LevelsPanelLabels } from './levels-panel';

const labels: LevelsPanelLabels = {
  add: 'labels.add',
  remove: 'labels.remove',
  addTitle: 'labels.addTitle',
  editTitle: 'labels.editTitle',
  removeTitle: 'labels.removeTitle',
  removeMessage: (count) => `labels.removeMessage.${count}`,
  optionLabel: 'labels.option',
  levelLabel: 'labels.level',
  optionRequired: 'labels.optionRequired',
  levelRequired: 'labels.levelRequired',
  duplicate: 'labels.duplicate',
  empty: 'labels.empty',
};

const groups = [
  {
    id: 'g1',
    title: 'Frontend',
    items: [
      { key: 'react', label: 'React', level: 'junior', progress: 0.4, tone: 'blue' as const },
      { key: 'vue', label: 'Vue', level: 'senior', progress: 0.8, tone: 'green' as const },
    ],
  },
  { id: 'g2', items: [] },
];

describe('LevelsPanel', () => {
  it('shows empty state and hides actions in readOnly', () => {
    render(
      h(LevelsPanel, {
        groups: [],
        readOnly: true,
        options: [],
        levels: [],
        labels,
        onAdd: vi.fn(),
        onUpdate: vi.fn(),
        onRemove: vi.fn(),
      })
    );

    expect(screen.getByText('labels.empty')).toBeInTheDocument();
    expect(screen.queryByText('labels.add')).not.toBeInTheDocument();
  });

  it('renders groups and opens add modal', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);

    render(
      h(LevelsPanel, {
        groups,
        readOnly: false,
        options: [{ value: 'react', label: 'React' }],
        levels: [{ value: 'senior', label: 'Senior' }],
        labels,
        onAdd,
        onUpdate: vi.fn(),
        onRemove: vi.fn(),
      })
    );

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /labels.add/ }));
    expect(screen.getByText('labels.addTitle')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'submit-level' }));
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith('react', 'senior'));
    await waitFor(() => expect(screen.queryByText('labels.addTitle')).not.toBeInTheDocument());
  });

  it('opens edit modal for item click', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      h(LevelsPanel, {
        groups,
        readOnly: false,
        options: [],
        levels: [{ value: 'senior', label: 'Senior' }],
        labels,
        onAdd: vi.fn(),
        onUpdate,
        onRemove: vi.fn(),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'common.update React' }));
    expect(screen.getByText('labels.editTitle')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'submit-level' }));
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith('react', 'senior'));
  });

  it('supports selection mode remove flow and cancels selection', async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined);

    render(
      h(LevelsPanel, {
        groups,
        readOnly: false,
        options: [],
        levels: [],
        labels,
        onAdd: vi.fn(),
        onUpdate: vi.fn(),
        onRemove,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /labels.remove/ }));
    fireEvent.click(screen.getByRole('button', { name: 'common.select React' }));
    fireEvent.click(screen.getByRole('button', { name: 'common.select Vue' }));
    fireEvent.click(screen.getByRole('button', { name: 'common.select Vue' }));

    fireEvent.click(screen.getByRole('button', { name: /common.delete/ }));
    expect(screen.getByText('labels.removeTitle')).toBeInTheDocument();
    expect(screen.getByText('labels.removeMessage.1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'confirm-remove' }));
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith(['react']));

    fireEvent.click(screen.getByRole('button', { name: /labels.remove/ }));
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(screen.getByRole('button', { name: /labels.add/ })).toBeInTheDocument();
  });

  it('surfaces action errors and closes modals', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('fail-add'));

    render(
      h(LevelsPanel, {
        groups,
        readOnly: false,
        options: [],
        levels: [],
        labels,
        onAdd,
        onUpdate: vi.fn(),
        onRemove: vi.fn(),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: /labels.add/ }));
    fireEvent.click(screen.getByRole('button', { name: 'submit-level' }));
    await waitFor(() => expect(screen.getByText('fail-add')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'close-level' }));
    await waitFor(() => expect(screen.queryByText('labels.addTitle')).not.toBeInTheDocument());
  });

  it('falls back to generic error for non-Error rejects', async () => {
    const onUpdate = vi.fn().mockRejectedValue('nope');

    render(
      h(LevelsPanel, {
        groups,
        readOnly: false,
        options: [],
        levels: [],
        labels,
        onAdd: vi.fn(),
        onUpdate,
        onRemove: vi.fn(),
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'common.update React' }));
    fireEvent.click(screen.getByRole('button', { name: 'submit-level' }));
    await waitFor(() => expect(screen.getByText('errors.somethingWentWrong')).toBeInTheDocument());
  });
});
