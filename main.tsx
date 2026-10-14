import React from 'react';
import { createRoot } from 'react-dom/client';
import Site from './Site';
import './site.css';
import './extras.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><Site /></React.StrictMode>);
