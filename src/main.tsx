import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { EmpresaProvider } from './modules/configuracion/EmpresaProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmpresaProvider>
      <App />
    </EmpresaProvider>
  </StrictMode>,
);

