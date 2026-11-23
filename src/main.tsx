import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles.css';
import App from './App';

const theme = createTheme({
  primaryColor: 'teal',
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  defaultRadius: 'md',
  components: {
    Card: { defaultProps: { shadow: 'xs' } },
    Button: { defaultProps: { radius: 'md' } },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications position="top-right" zIndex={3000} />
      <App />
    </MantineProvider>
  </StrictMode>,
);
