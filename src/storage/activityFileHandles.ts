export interface ActivityFileHandleStoreError extends Error {
  readonly code: "unsupported" | "storage";
}

export function supportsPersistentActivityFileHandles(): boolean {
  return (
    typeof window !== "undefined" &&
    "showOpenFilePicker" in window &&
    typeof window.indexedDB !== "undefined"
  );
}

export function createActivityHandleId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("cycling-performance-assistant", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("activity-file-handles");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeActivityFileHandle(
  handleId: string,
  handle: FileSystemFileHandle,
): Promise<void> {
  if (!supportsPersistentActivityFileHandles()) {
    throw Object.assign(new Error("Persistent file handles are not supported."), {
      code: "unsupported",
    }) as ActivityFileHandleStoreError;
  }

  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("activity-file-handles", "readwrite");
      transaction.objectStore("activity-file-handles").put(handle, handleId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  } catch (error) {
    throw Object.assign(
      new Error("The browser-local file handle could not be stored.", {
        cause: error,
      }),
      { code: "storage" },
    ) as ActivityFileHandleStoreError;
  }
}

export async function getActivityFileHandle(
  handleId: string,
): Promise<FileSystemFileHandle | null> {
  const database = await openDatabase();
  return new Promise<FileSystemFileHandle | null>((resolve, reject) => {
    const transaction = database.transaction("activity-file-handles", "readonly");
    const request = transaction.objectStore("activity-file-handles").get(handleId);
    request.onsuccess = () =>
      resolve((request.result as FileSystemFileHandle | undefined) ?? null);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

export async function removeActivityFileHandle(handleId: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("activity-file-handles", "readwrite");
    transaction.objectStore("activity-file-handles").delete(handleId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
