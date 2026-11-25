import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { Soundboard } from './Soundboard';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Soundboard />
  </StrictMode>,
);
