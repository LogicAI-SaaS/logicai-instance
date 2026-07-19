import { createBrowserRouter } from 'react-router';
import React from 'react';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import { CredentialsPage } from './pages/CredentialsPage';
import DatabasePage from './pages/DatabasePage';
import DatabaseManagerPage from './pages/DatabaseManagerPage';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { FormSubmissionPage } from './pages/FormSubmissionPage';
import SettingsPage from './pages/SettingsPage';

// Use a factory function to evaluate elements at runtime
export const getRouter = () => createBrowserRouter([
  {
    path: '/',
    element: React.createElement(Dashboard),
  },
  {
    path: '/workflow/:id',
    element: React.createElement(WorkflowEditor),
  },
  {
    path: '/workflow/new',
    element: React.createElement(WorkflowEditor),
  },
  {
    path: '/credentials',
    element: React.createElement(CredentialsPage),
  },
  {
    path: '/database',
    element: React.createElement(DatabasePage),
  },
  {
    path: '/database/:id',
    element: React.createElement(DatabaseManagerPage),
  },
  {
    path: '/login',
    element: React.createElement(Login),
  },
  {
    path: '/register',
    element: React.createElement(Register),
  },
  {
    path: '/form/:formId',
    element: React.createElement(FormSubmissionPage),
  },
  {
    path: '/settings',
    element: React.createElement(SettingsPage),
  },
]);
