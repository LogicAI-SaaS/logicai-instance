/**
 * credentialService — lightweight localStorage-backed credential store.
 */

import type { Credential, CredentialType } from '../types/credentials';

const LS_KEY = 'logicai_credentials';

export function readCredentials(): Credential[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Credential[];
  } catch {
    return [];
  }
}

function write(creds: Credential[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(creds));
}

export function addCredential(
  cred: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>,
): Credential {
  const now = new Date().toISOString();
  const full: Credential = {
    ...cred,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: now,
    updatedAt: now,
  };
  write([...readCredentials(), full]);
  return full;
}

export function updateCredential(id: string, patch: Partial<Omit<Credential, 'id' | 'createdAt'>>): void {
  write(
    readCredentials().map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
    ),
  );
}

export function deleteCredential(id: string): void {
  write(readCredentials().filter((c) => c.id !== id));
}

export function getCredentialsForType(type: CredentialType): Credential[] {
  return readCredentials().filter((c) => c.type === type);
}
