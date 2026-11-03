'use client';

import type { ReactNode, Ref } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { CvPreviewModel } from '../types/CvPreviewTypes';

function Split({ left, children }: { left: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[30%_minmax(0,1fr)]">
      <div className="pr-6">{left}</div>
      <div className="border-primary border-l pl-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="mb-2 font-bold">{label}</h3>
      <div>{children}</div>
    </div>
  );
}

interface CvPreviewDocumentProps {
  model: CvPreviewModel;
  ref?: Ref<HTMLDivElement>;
}

export function CvPreviewDocument({ model, ref }: CvPreviewDocumentProps) {
  const { t } = useTranslation();

  return (
    <div
      ref={ref}
      data-pdf-root
      className="text-m text-foreground mx-auto w-full max-w-225 sm:p-10"
    >
      <header className="mb-8">
        <h1 className="text-4xl">{model.fullName}</h1>
        {model.position ? <p className="uppercase">{model.position}</p> : null}
      </header>

      <Split
        left={
          <>
            <Field label={t('common.education')}>{model.education || '—'}</Field>
            <Field label={t('preview.languageProficiency')}>
              {model.languages.length ? (
                <ul>
                  {model.languages.map((language) => (
                    <li key={language.name}>
                      {language.name} — {language.proficiency}
                    </li>
                  ))}
                </ul>
              ) : (
                '—'
              )}
            </Field>
            <Field label={t('preview.domains')}>
              {model.domains.length ? (
                <ul>
                  {model.domains.map((domain) => (
                    <li key={domain}>{domain}</li>
                  ))}
                </ul>
              ) : (
                '—'
              )}
            </Field>
          </>
        }
      >
        <Field label={model.name}>
          <p className="whitespace-pre-line">{model.description}</p>
        </Field>
        {model.skillGroups.map((group) => (
          <Field key={group.id} label={group.title}>
            {group.skills.join(', ')}.
          </Field>
        ))}
      </Split>

      {model.projects.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-4xl">{t('preview.projects')}</h2>

          <div className="flex flex-col gap-10">
            {model.projects.map((project) => (
              <article key={project.id} className="break-inside-avoid">
                <Split
                  left={
                    <>
                      <h3 className="text-primary font-bold uppercase">{project.name}</h3>
                      <p className="mt-2.5">{project.description}</p>
                    </>
                  }
                >
                  {project.roles.length > 0 && (
                    <Field label={t('preview.projectRoles')}>{project.roles.join(', ')}</Field>
                  )}
                  <Field label={t('preview.period')}>{project.period}</Field>
                  {project.responsibilities.length > 0 && (
                    <Field label={t('preview.responsibilities')}>
                      <ul className="marker:text-foreground list-disc pl-4">
                        {project.responsibilities.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </Field>
                  )}
                  {project.environment.length > 0 && (
                    <Field label={t('preview.environment')}>
                      {project.environment.join(', ')}.
                    </Field>
                  )}
                </Split>
              </article>
            ))}
          </div>
        </section>
      )}

      {model.skillTables.length > 0 && (
        <section className="mt-14">
          <h2 className="text-foreground mb-8 text-4xl">{t('preview.professionalSkills')}</h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-primary border-b text-sm tracking-wide uppercase">
                <th colSpan={2} className="pt-2.5 pl-4 text-left align-top font-medium">
                  {t('preview.skill')}
                </th>
                <th className="w-35 px-8 py-2.5 text-center align-top font-medium">
                  {t('preview.experienceInYears')}
                </th>
                <th className="w-35 px-8 py-2.5 text-center align-top font-medium">
                  {t('preview.lastUsed')}
                </th>
              </tr>
            </thead>

            {model.skillTables.map((table) => (
              <tbody key={table.id} className="border-muted break-inside-avoid border-b">
                {table.rows.map((row, index) => {
                  const padding = [
                    'py-2',
                    index === 0 ? 'pt-4' : '',
                    index === table.rows.length - 1 ? 'pb-4' : '',
                  ].join(' ');

                  return (
                    <tr key={row.name}>
                      {index === 0 && (
                        <th
                          rowSpan={table.rows.length}
                          scope="rowgroup"
                          className="text-primary w-58 p-4 text-left align-top text-sm font-bold"
                        >
                          {table.title}
                        </th>
                      )}
                      <td className={`pr-4 font-medium ${padding}`}>{row.name}</td>
                      <td className={`text-center ${padding}`}>{row.years ?? '—'}</td>
                      <td className={`text-center ${padding}`}>{row.lastUsed ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </section>
      )}
    </div>
  );
}
