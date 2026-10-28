'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Pagination } from '@/features/users/ui/Pagination';
import { useCvActions } from '../model/useCvActions';
import { useCvs } from '../model/useCvs';
import type { CvFormValues, CvListItem } from '../types/CvTypes';
import { CvFormModal } from './CvFormModal';
import { CvsTable } from './CvsTable';
import { SearchInput } from '@/components/ui/search-input';

type ModalState =
  { type: 'create' } | { type: 'edit'; cv: CvListItem } | { type: 'delete'; cv: CvListItem } | null;

const MIN_PAGE_SIZE = 10;

export function CvsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const cvs = useCvs();
  const actions = useCvActions(cvs.refetch);

  const [modal, setModal] = useState<ModalState>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const closeModal = () => {
    setModal(null);
    setError('');
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

  const editCv = modal?.type === 'edit' ? modal.cv : undefined;
  const deleteCv = modal?.type === 'delete' ? modal.cv : undefined;

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchInput value={cvs.search} onChange={cvs.setSearch} className="pl-5" />
        <Button
          variant="primaryV2"
          className="mr-5 flex w-55 items-center justify-center gap-2"
          onClick={() => setModal({ type: 'create' })}
        >
          <Plus size={20} />
          {t('cv.create')}
        </Button>
      </div>

      {cvs.error ? (
        <div className="flex flex-col items-center gap-4 pt-16 text-center">
          <p className="text-primary text-sm">{t('errors.loadCvs')}</p>
          <Button variant="secondary" onClick={() => void cvs.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <>
          <CvsTable
            items={cvs.items}
            fallbackEmail={cvs.email}
            loading={cvs.initialLoading}
            busy={cvs.loading && !cvs.initialLoading}
            emptyText={cvs.isSearching ? t('errors.noCvsFound') : t('errors.noCVsYet')}
            sortDirection={cvs.sortDirection}
            onSort={cvs.toggleSort}
            onView={(cv) => router.push(`/cvs/${cv.id}`)}
            onEdit={(cv) => setModal({ type: 'edit', cv })}
            onDelete={(cv) => setModal({ type: 'delete', cv })}
          />

          {cvs.total > MIN_PAGE_SIZE && (
            <Pagination
              page={cvs.page}
              totalPages={cvs.totalPages}
              pageSize={cvs.limit}
              onPageChange={cvs.setPage}
              onPageSizeChange={cvs.setLimit}
            />
          )}
        </>
      )}

      <CvFormModal
        open={modal?.type === 'create' || modal?.type === 'edit'}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        mode={editCv ? 'edit' : 'create'}
        initial={
          editCv
            ? {
                name: editCv.name,
                education: editCv.education ?? '',
                description: editCv.description,
              }
            : undefined
        }
        loading={pending}
        error={error}
        onSubmit={(values: CvFormValues) =>
          run(() => (editCv ? actions.update(editCv.id, values) : actions.create(values)))
        }
      />

      <ConfirmModal
        open={modal?.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        title={t('errors.deleteCvTitle')}
        message={t('errors.deleteCvMessage', { name: deleteCv?.name ?? '' })}
        loading={pending}
        error={error}
        onConfirm={() => {
          if (!deleteCv) return;
          void run(
            () => actions.remove(deleteCv.id),
            () => {
              if (cvs.items.length === 1 && cvs.page > 1) cvs.setPage(cvs.page - 1);
            }
          );
        }}
      />
    </div>
  );
}
