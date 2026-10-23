'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { SearchInput } from '@/components/ui/search-input';
import { parseDate, toISODate } from '@/shared/lib/date';
import { useCvProjectActions } from '../model/useCvProjectActions';
import { useCvProjects } from '../model/useCvProjects';
import type { CvProjectItem, CvProjectPayload } from '../types/CvProjectTypes';
import { CvProjectModal } from './CvProjectModal';
import { CvProjectsTable } from './CvProjectsTable';

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; item: CvProjectItem }
  | { type: 'delete'; item: CvProjectItem }
  | null;

export function CvProjectsPage({ cvId }: { cvId: string }) {
  const list = useCvProjects(cvId);
  const actions = useCvProjectActions(cvId);

  const [modal, setModal] = useState<ModalState>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const closeModal = () => {
    setModal(null);
    setError('');
  };

  const run = async (action: () => Promise<void>) => {
    setPending(true);
    setError('');
    try {
      await action();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again');
    } finally {
      setPending(false);
    }
  };

  const editItem = modal?.type === 'edit' ? modal.item : undefined;
  const deleteItem = modal?.type === 'delete' ? modal.item : undefined;

  const addedIds = new Set(list.allItems.map((item) => item.project.id));
  const availableProjects = actions.catalog.filter((project) => !addedIds.has(project.id));

  return (
    <div className="flex min-h-full flex-col gap-6 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchInput value={list.search} onChange={list.setSearch} className="pl-5" />
        <Button
          variant="primaryV2"
          className="flex items-center gap-2"
          onClick={() => setModal({ type: 'add' })}
        >
          <Plus size={20} />
          Add project
        </Button>
      </div>

      {list.error ? (
        <div className="flex flex-col items-center gap-4 pt-16 text-center">
          <p className="text-primary text-sm">Failed to load projects</p>
          <Button variant="secondary" onClick={() => void list.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <CvProjectsTable
          items={list.items}
          loading={list.initialLoading}
          emptyText={list.isSearching ? 'No projects found' : 'No projects added yet'}
          sortKey={list.sortKey}
          sortDirection={list.sortDirection}
          onSort={list.toggleSort}
          onEdit={(item) => setModal({ type: 'edit', item })}
          onDelete={(item) => setModal({ type: 'delete', item })}
        />
      )}

      <CvProjectModal
        open={modal?.type === 'add' || modal?.type === 'edit'}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        mode={editItem ? 'edit' : 'add'}
        projects={editItem ? [editItem.project] : availableProjects}
        roles={actions.roles}
        initial={
          editItem
            ? {
                projectId: editItem.project.id,
                startDate: toISODate(parseDate(editItem.start_date)),
                endDate: toISODate(parseDate(editItem.end_date)),
                roles: editItem.roles,
                responsibilities: editItem.responsibilities.join(' '),
              }
            : undefined
        }
        loading={pending}
        error={error}
        onSubmit={(payload: CvProjectPayload) =>
          run(() => (editItem ? actions.update(payload) : actions.add(payload)))
        }
      />

      <ConfirmModal
        open={modal?.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        title="Remove project"
        message={`Are you sure you want to remove project ${deleteItem?.name ?? ''}?`}
        loading={pending}
        error={error}
        onConfirm={() => {
          if (!deleteItem) return;
          void run(() => actions.remove(deleteItem.project.id));
        }}
      />
    </div>
  );
}
