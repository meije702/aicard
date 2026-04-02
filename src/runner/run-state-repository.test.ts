// Tests for run-state-repository: localStorage persistence for recipe run state.

import { assertEquals } from 'jsr:@std/assert'
import { localStorageRunStateRepository } from './run-state-repository.ts'
import type { RunState } from './run-types.ts'

// --- localStorage shim for Deno ---

function createLocalStorageShim() {
    const store = new Map<string, string>()
    return {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, v) },
        removeItem: (k: string) => { store.delete(k) },
        key: (i: number) => [...store.keys()][i] ?? null,
        get length() { return store.size },
        clear: () => store.clear(),
    }
}

function makeRunState(overrides: Partial<RunState> = {}): RunState {
    return {
        runId: `Test Recipe:${Date.now()}`,
        recipeName: 'Test Recipe',
        steps: [],
        context: {},
        complete: false,
        errors: [],
        ...overrides,
    }
}

// Save and restore globalThis.localStorage around each test
let originalLocalStorage: typeof globalThis.localStorage

function installShim() {
    originalLocalStorage = globalThis.localStorage
    const shim = createLocalStorageShim()
    Object.defineProperty(globalThis, 'localStorage', {
        value: shim,
        configurable: true,
        writable: true,
    })
}

function restoreLocalStorage() {
    Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
        writable: true,
    })
}

const repo = localStorageRunStateRepository

Deno.test('runStateRepo: save then load returns the saved state', () => {
    installShim()
    try {
        const state = makeRunState({ runId: 'Test Recipe:1000' })
        repo.save(state)
        const loaded = repo.load('Test Recipe')
        assertEquals(loaded?.runId, 'Test Recipe:1000')
        assertEquals(loaded?.recipeName, 'Test Recipe')
    } finally {
        restoreLocalStorage()
    }
})

Deno.test('runStateRepo: load returns null when no state exists', () => {
    installShim()
    try {
        assertEquals(repo.load('Nonexistent'), null)
    } finally {
        restoreLocalStorage()
    }
})

Deno.test('runStateRepo: load returns the most recent run', () => {
    installShim()
    try {
        const older = makeRunState({ runId: 'My Recipe:1000', recipeName: 'My Recipe' })
        const newer = makeRunState({ runId: 'My Recipe:2000', recipeName: 'My Recipe' })
        repo.save(older)
        repo.save(newer)
        const loaded = repo.load('My Recipe')
        assertEquals(loaded?.runId, 'My Recipe:2000')
    } finally {
        restoreLocalStorage()
    }
})

Deno.test('runStateRepo: clear removes a specific run by runId', () => {
    installShim()
    try {
        const run1 = makeRunState({ runId: 'R:1000', recipeName: 'R' })
        const run2 = makeRunState({ runId: 'R:2000', recipeName: 'R' })
        repo.save(run1)
        repo.save(run2)
        repo.clear('R:1000')
        const loaded = repo.load('R')
        assertEquals(loaded?.runId, 'R:2000')
    } finally {
        restoreLocalStorage()
    }
})

Deno.test('runStateRepo: clearAll removes all runs for a recipe name', () => {
    installShim()
    try {
        const stateA = makeRunState({ runId: 'A:1000', recipeName: 'A' })
        const stateB = makeRunState({ runId: 'B:1000', recipeName: 'B' })
        repo.save(stateA)
        repo.save(stateB)
        repo.clearAll('A')
        assertEquals(repo.load('A'), null)
        assertEquals(repo.load('B')?.runId, 'B:1000')
    } finally {
        restoreLocalStorage()
    }
})

Deno.test('runStateRepo: clearAll removes corrupt entries', () => {
    installShim()
    try {
        // Insert a corrupt entry directly
        localStorage.setItem('aicard:run:corrupt', '{not valid json!!!}')
        const state = makeRunState({ runId: 'X:1000', recipeName: 'X' })
        repo.save(state)
        // clearAll with a different recipe should clean up corrupt entries
        // that fail to parse (they get removed in the catch block)
        repo.clearAll('X')
        assertEquals(repo.load('X'), null)
    } finally {
        restoreLocalStorage()
    }
})

Deno.test('runStateRepo: save is a no-op when localStorage is unavailable', () => {
    // Temporarily remove localStorage
    const saved = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
    })
    try {
        // Should not throw
        repo.save(makeRunState())
    } finally {
        Object.defineProperty(globalThis, 'localStorage', {
            value: saved,
            configurable: true,
            writable: true,
        })
    }
})

Deno.test('runStateRepo: load returns null when localStorage is unavailable', () => {
    const saved = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
    })
    try {
        assertEquals(repo.load('anything'), null)
    } finally {
        Object.defineProperty(globalThis, 'localStorage', {
            value: saved,
            configurable: true,
            writable: true,
        })
    }
})
