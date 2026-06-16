(() => {
  'use strict';

  function normalizeStorages(storages) {
    if (Array.isArray(storages) && storages.length > 0) {
      return storages.filter(Boolean);
    }

    return [sessionStorage, localStorage].filter(Boolean);
  }

  function readJson(key, storages) {
    for (const storage of normalizeStorages(storages)) {
      try {
        const raw = storage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (err) {
        console.warn('[dcine-storage] cannot read key', key, err);
      }
    }

    return null;
  }

  function writeJson(key, value, storages) {
    if (!value || typeof value !== 'object') return;

    const serialized = JSON.stringify(value);
    for (const storage of normalizeStorages(storages)) {
      try {
        storage.setItem(key, serialized);
      } catch (err) {
        console.warn('[dcine-storage] cannot save key', key, err);
      }
    }
  }

  function removeJson(key, storages) {
    for (const storage of normalizeStorages(storages)) {
      try {
        storage.removeItem(key);
      } catch (err) {
        console.warn('[dcine-storage] cannot remove key', key, err);
      }
    }
  }

  window.DCineStorage = window.DCineStorage || {
    readJson,
    writeJson,
    removeJson
  };
})();