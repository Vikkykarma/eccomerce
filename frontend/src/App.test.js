import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './components/AppRouter';
import { store } from './store/store';

test('authenticates before rendering the admin dashboard', async () => {
  localStorage.clear();
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ token: 'test-token', user: { email: 'admin@northand.local', role: 'admin' } }),
    ok: true,
  });
  render(<Provider store={store}><BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AppRouter /></BrowserRouter></Provider>);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@northand.local' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: /good morning, alex/i })).toBeInTheDocument());
  expect(screen.getByText('Revenue overview')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
});
