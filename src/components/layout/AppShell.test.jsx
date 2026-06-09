import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import * as parserModule from '@/parser/parser';
import { AppShell } from '@/components/layout/AppShell';

describe('AppShell integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces parsing during rapid typing', async () => {
    const parseSpy = vi.spyOn(parserModule, 'parse');

    render(<AppShell />);

    const editor = screen.getByLabelText('Layout editor');
    const initialCalls = parseSpy.mock.calls.length;

    fireEvent.change(editor, { target: { value: '# A' } });
    fireEvent.change(editor, { target: { value: '# Ab' } });
    fireEvent.change(editor, { target: { value: '# Abc' } });

    expect(parseSpy).toHaveBeenCalledTimes(initialCalls);

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(parseSpy).toHaveBeenCalledTimes(initialCalls + 1);
  });

  it('loads templates and reparses the workspace', async () => {
    render(<AppShell />);

    fireEvent.change(screen.getByLabelText('Layout template'), {
      target: { value: 'dashboard' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load Template' }));

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByLabelText('Layout editor').value).toContain('# Sidebar');
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('links preview selection back to editor source focus', async () => {
    render(<AppShell />);

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Welcome' }));

    expect(screen.getByText('H1 • lines 3-3')).toBeInTheDocument();
  });

  it('links AST graph selection back to editor source focus', async () => {
    render(<AppShell />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /\+Show Developer Tools \(Advanced\)/,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'col width=100' }));

    expect(screen.getByText('COL 100% • lines 2-5')).toBeInTheDocument();
  });

  it('clears selection safely after a reparse removes the node', async () => {
    render(<AppShell />);

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Welcome' }));
    expect(screen.getByText('H1 • lines 3-3')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Layout editor'), {
      target: { value: '' },
    });

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(
      screen.getByText(
        'Move through the source to inspect the matching layout region.',
      ),
    ).toBeInTheDocument();
  });

  it('exports the in-memory ast as ast.json', async () => {
    const createObjectURL = vi
      .spyOn(window.URL, 'createObjectURL')
      .mockReturnValue('blob:ast');
    const revokeObjectURL = vi
      .spyOn(window.URL, 'revokeObjectURL')
      .mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    render(<AppShell />);

    fireEvent.click(screen.getByRole('button', { name: 'Export AST' }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:ast');
    expect(
      screen.getByRole('button', { name: 'AST Exported' }),
    ).toBeInTheDocument();
  });

  it('restores persisted content and survives malformed storage', async () => {
    window.localStorage.setItem('mcle-workspace-v1', '# Restored');

    const { unmount } = render(<AppShell />);

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByLabelText('Layout editor')).toHaveValue('# Restored');

    unmount();

    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('storage broken');
    });

    render(<AppShell />);

    expect(screen.getByLabelText('Layout editor').value).toContain(':::row');
  });

  it('reset workspace restores the starter template', async () => {
    render(<AppShell />);

    fireEvent.change(screen.getByLabelText('Layout editor'), {
      target: { value: '# Custom' },
    });

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset Workspace' }));

    expect(screen.getByLabelText('Layout editor').value).toContain(
      'Describe your layout here.',
    );
  });
});
