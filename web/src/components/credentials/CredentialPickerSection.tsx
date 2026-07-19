/**
 * CredentialPickerSection
 *
 * Inline credential selector for the NodeConfigModal.
 * Shows a dropdown of existing credentials for the node's required service,
 * plus a "+ Nouveau" button that opens a mini creation form.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Shield, Eye, EyeOff } from 'lucide-react';
import type { Credential, CredentialType } from '../../types/credentials';
import { CREDENTIAL_FIELDS, SERVICE_INFO, applyCredentialToConfig } from '../../types/credentials';
import {
  getCredentialsForType,
  addCredential,
} from '../../services/credentialService';

// ─── Mini inline creation form ───────────────────────────────────────────────

const MiniCredentialForm: React.FC<{
  credType: CredentialType;
  onSave: (cred: Credential) => void;
  onCancel: () => void;
}> = ({ credType, onSave, onCancel }) => {
  const { t } = useTranslation();
  const service = SERVICE_INFO[credType];
  const fields = CREDENTIAL_FIELDS[credType] ?? [];

  const [name, setName] = useState(service ? `${service.name} credential` : credType);
  const [values, setValues] = useState<Record<string, string>>({});
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

  const set = (key: string, val: string) => setValues((p) => ({ ...p, [key]: val }));
  const toggle = (key: string) => setShowMasked((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = addCredential({ type: credType, name, credentials: values });
    onSave(saved);
  };

  return (
    <div className="mt-3 p-4 bg-black/40 border border-orange-500/30 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{service?.icon ?? '🔑'}</span>
        <div>
          <p className="text-sm font-semibold text-white">{t('credentials.formNew', { name: service?.name ?? credType })}</p>
          <p className="text-[11px] text-gray-500">{service?.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1 uppercase tracking-wide">Nom</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-xs"
          />
        </div>

        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-[11px] text-gray-500 mb-1">
              {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            <div className="relative">
              <input
                type={field.masked && !showMasked[field.key] ? 'password' : 'text'}
                value={values[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder ?? ''}
                required={field.required}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 text-xs pr-8 font-mono"
              />
              {field.masked && (
                <button type="button" onClick={() => toggle(field.key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                  {showMasked[field.key] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 rounded-lg text-xs font-medium transition-colors">
            {t('common.cancel')}
          </button>
          <button type="submit"
            className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors">
            {t('credentials.createAndApply')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Main section ────────────────────────────────────────────────────────────

interface Props {
  credentialType: CredentialType;
  /** Currently selected credential id (from config.__credentialId) */
  selectedCredentialId?: string;
  onApply: (credentialId: string, configPatch: Record<string, unknown>) => void;
}

export const CredentialPickerSection: React.FC<Props> = ({
  credentialType,
  selectedCredentialId,
  onApply,
}) => {
  const { t } = useTranslation();
  const service = SERVICE_INFO[credentialType];
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showForm, setShowForm] = useState(false);

  const reload = () => setCredentials(getCredentialsForType(credentialType));

  useEffect(() => {
    reload();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentialType]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;
    const cred = credentials.find((c) => c.id === id);
    if (!cred) return;
    const patch = applyCredentialToConfig(credentialType, cred.credentials);
    onApply(id, patch);
  };

  const handleSaved = (cred: Credential) => {
    reload();
    setShowForm(false);
    const patch = applyCredentialToConfig(credentialType, cred.credentials);
    onApply(cred.id, patch);
  };

  return (
    <div className="mb-5 pb-5 border-b border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span className="text-[11px] font-semibold text-orange-300 uppercase tracking-widest">
          Credential {service ? `— ${service.name}` : ''}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selectedCredentialId ?? ''}
            onChange={handleSelect}
            className="w-full appearance-none px-3 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 pr-8 cursor-pointer"
          >
            <option value="">
              {credentials.length === 0 ? t('credentials.noCredentials') : t('credentials.selectCredential')}
            </option>
            {credentials.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          title="Nouveau credential"
          className={`px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
            showForm
              ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs">Nouveau</span>
        </button>
      </div>

      {showForm && (
        <MiniCredentialForm
          credType={credentialType}
          onSave={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default CredentialPickerSection;
