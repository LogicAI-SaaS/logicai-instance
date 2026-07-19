import React from 'react';
import { RouterProvider } from 'react-router';
import { getRouter } from './router';
import { ExecutionProvider } from './contexts/ExecutionContext';
import { InstanceAuthProvider } from './components/auth/InstanceAuthProvider';

function App() {
  const router = getRouter();
  return (
    <InstanceAuthProvider>
      <ExecutionProvider>
        <RouterProvider router={router} />
      </ExecutionProvider>
    </InstanceAuthProvider>
  );
}

export default App;
