import { getWorkflowStatus } from '../../services/workflow';
import type { AcademicWorkflowProgress } from './academicWorkflow.rules';
import { getAcademicWorkflowContextKey, rememberAcademicWorkflowProgress } from './academicWorkflow.repository';

export const EMPTY_WORKFLOW_PROGRESS: AcademicWorkflowProgress = {};
const FRESHNESS_MS = 5_000;
interface WorkflowStore {
  key: string;
  progress: AcademicWorkflowProgress;
  loadedAt: number | null;
  revision: number;
  pending: Promise<void> | null;
  refreshAfterPending: boolean;
  listeners: Set<() => void>;
  onChange: () => void;
}
const stores = new Map<string, WorkflowStore>();
let listening = false;
const handleWorkflowChange = () => stores.get(getAcademicWorkflowContextKey())?.onChange();

function refresh(store: WorkflowStore, force = false): void {
  if (store.pending) {
    if (force) store.refreshAfterPending = true;
    return;
  }
  if (!force && store.loadedAt !== null && Date.now() - store.loadedAt < FRESHNESS_MS) return;
  const revision = store.revision;
  store.pending = getWorkflowStatus().then((progress) => {
    if (store.revision !== revision) return;
    store.progress = progress;
    store.loadedAt = Date.now();
    rememberAcademicWorkflowProgress(progress, store.key);
    store.listeners.forEach((listener) => listener());
  }).catch(() => {
    if (store.revision !== revision) return;
    store.progress = EMPTY_WORKFLOW_PROGRESS;
    store.loadedAt = null;
    rememberAcademicWorkflowProgress(store.progress, store.key);
    store.listeners.forEach((listener) => listener());
  }).finally(() => {
    store.pending = null;
    if (store.refreshAfterPending) {
      store.refreshAfterPending = false;
      if (store.listeners.size) refresh(store, true);
    }
  });
}

function storeFor(key: string): WorkflowStore {
  let store = stores.get(key);
  if (!store) {
    const created: WorkflowStore = {
      key, progress: EMPTY_WORKFLOW_PROGRESS, loadedAt: null, revision: 0,
      pending: null, refreshAfterPending: false, listeners: new Set(),
      onChange: () => {
        created.revision++;
        created.loadedAt = null;
        if (created.listeners.size) refresh(created, true);
      },
    };
    store = created;
    stores.set(key, store);
  }
  return store;
}

export function readWorkflowSnapshot(key: string): AcademicWorkflowProgress {
  return storeFor(key).progress;
}

export function subscribeWorkflowProgress(key: string, listener: () => void): () => void {
  const store = storeFor(key);
  store.listeners.add(listener);
  if (!listening) {
    window.addEventListener('secub:workflow-changed', handleWorkflowChange);
    listening = true;
  }
  rememberAcademicWorkflowProgress(store.progress, key);
  refresh(store);
  return () => {
    store.listeners.delete(listener);
  };
}

export function clearWorkflowProgressCache(): void {
  for (const store of stores.values()) {
    store.revision++;
    store.refreshAfterPending = false;
  }
  window.removeEventListener('secub:workflow-changed', handleWorkflowChange);
  listening = false;
  stores.clear();
  rememberAcademicWorkflowProgress(EMPTY_WORKFLOW_PROGRESS, getAcademicWorkflowContextKey());
}
