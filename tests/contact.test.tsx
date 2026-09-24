import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Contact } from '../src/app/components/Contact';
import { LanguageProvider } from '../src/app/i18n';

afterEach(() => localStorage.clear());

describe('contact validation', () => {
  it.each(['mn', 'en'])('shows translated errors and focuses the first field (%s)', (lang) => {
    localStorage.setItem('lang', lang);
    const { container } = render(<LanguageProvider><Contact /></LanguageProvider>);
    fireEvent.submit(container.querySelector('form')!);
    expect(screen.getAllByRole('alert')).toHaveLength(3);
    expect(screen.getByLabelText(lang === 'en' ? 'Name' : 'Нэр')).toHaveFocus();
    expect(screen.getByText(lang === 'en' ? 'Write at least 20 characters' : 'Дор хаяж 20 тэмдэгт бичнэ үү')).toBeInTheDocument();
  });

  it('rejects malformed email and whitespace-padded short brief, then accepts corrected input', async () => {
    const { container } = render(<LanguageProvider><Contact /></LanguageProvider>);
    fireEvent.change(screen.getByLabelText('Нэр'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('И-мэйл'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Brief'), { target: { value: `  ${'a'.repeat(19)}  ` } });
    fireEvent.submit(container.querySelector('form')!);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('И-мэйл'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Brief'), { target: { value: 'a'.repeat(20) } });
    // This only checks the existing UI acknowledgement; no backend exists yet.
    fireEvent.submit(container.querySelector('form')!);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Илгээж байна…' })).toBeDisabled();
    expect(await screen.findByText('Хүсэлт хүлээн авлаа', {}, { timeout: 2500 })).toBeInTheDocument();
  });
});
