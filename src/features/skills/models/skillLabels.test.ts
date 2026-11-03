import { describe, expect, it } from 'vitest';
import { SKILL_LABELS } from './skillLabels';

describe('SKILL_LABELS', () => {
  it('exposes static i18n keys for panel copy', () => {
    expect(SKILL_LABELS).toMatchObject({
      add: 'skills.add',
      remove: 'skills.remove',
      addTitle: 'skills.addTitle',
      editTitle: 'skills.editTitle',
      removeTitle: 'skills.removeTitle',
      optionLabel: 'skills.optionLabel',
      levelLabel: 'skills.levelLabel',
      optionRequired: 'skills.optionRequired',
      levelRequired: 'skills.levelRequired',
      duplicate: 'skills.duplicate',
      empty: 'skills.empty',
    });
  });

  it('picks singular or plural remove message by count', () => {
    expect(SKILL_LABELS.removeMessage(1)).toBe('skills.removeMessage_one');
    expect(SKILL_LABELS.removeMessage(0)).toBe('skills.removeMessage_other');
    expect(SKILL_LABELS.removeMessage(3)).toBe('skills.removeMessage_other');
  });
});
