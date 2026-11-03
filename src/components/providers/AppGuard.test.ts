import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { useIsMobile, useOnlineStatus } = vi.hoisted(() => ({
  useIsMobile: vi.fn(() => false),
  useOnlineStatus: vi.fn(() => true),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/hooks/useIsMobile', () => ({
  useIsMobile: () => useIsMobile(),
}));

vi.mock('@/shared/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => useOnlineStatus(),
}));

import { AppGuard } from './AppGuard';

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => value,
  });
}

describe('AppGuard', () => {
  let reload: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useIsMobile.mockReturnValue(false);
    useOnlineStatus.mockReturnValue(true);
    setOnline(true);
    reload = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setOnline(true);
  });

  it('renders children without overlay when desktop and online', () => {
    render(h(AppGuard, null, h('span', null, 'content')));

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.queryByText('errors.mobileTitle')).not.toBeInTheDocument();
    expect(screen.queryByText('errors.networkTitle')).not.toBeInTheDocument();
  });

  it('shows mobile error overlay and keeps children mounted', () => {
    useIsMobile.mockReturnValue(true);
    useOnlineStatus.mockReturnValue(false);

    render(h(AppGuard, null, h('span', null, 'content')));

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.getByText('errors.mobileTitle')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, node) => node?.textContent === 'errors.mobileDescriptionerrors.mobileHint'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('errors.networkTitle')).not.toBeInTheDocument();
    expect(screen.queryByText('common.retry')).not.toBeInTheDocument();
  });

  it('shows network error overlay when offline on desktop', () => {
    useOnlineStatus.mockReturnValue(false);

    render(h(AppGuard, null, h('span', null, 'content')));

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.getByText('errors.networkTitle')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, node) => node?.textContent === 'errors.networkDescriptionerrors.networkHint'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.retry' })).toBeInTheDocument();
  });

  it('reloads on retry when navigator reports online', () => {
    useOnlineStatus.mockReturnValue(false);
    setOnline(true);

    render(h(AppGuard, null, h('span', null, 'content')));
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));

    expect(reload).toHaveBeenCalled();
  });

  it('skips reload on retry when still offline', () => {
    useOnlineStatus.mockReturnValue(false);
    setOnline(false);

    render(h(AppGuard, null, h('span', null, 'content')));
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));

    expect(reload).not.toHaveBeenCalled();
  });
});
