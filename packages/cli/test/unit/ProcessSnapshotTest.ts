import { deepEqual, ok, strictEqual } from 'assert';
import Module = require('module');
import ProcessSnapshot from '../../src/ProcessSnapshot';

describe('ProcessSnapshot', function() {
  let fakeRequire: typeof require;
  let fakeProcess: typeof process;
  let fakeGlobal: typeof global;
  let messages: Array<string>;

  function log(...args: Array<{}>): void {
    messages.push(args.join(' '));
  }

  beforeEach(function() {
    fakeRequire = Object.create(require);
    fakeRequire.cache = Object.create(fakeRequire.cache);
    fakeRequire.extensions = Object.create(fakeRequire.extensions);

    // Start with a clean slate.
    fakeProcess = Object.create(process);
    fakeProcess['_events'] = Object.create(fakeProcess['_events']);
    fakeProcess.removeAllListeners();

    fakeGlobal = Object.create(global);

    messages = [];
  });

  it('removes added require entries from the cache', function() {
    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Add a file to the cache.
    const path = '/some/added/file';
    fakeRequire.cache[path] = new Module(path);
    ok(path in fakeRequire.cache);

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, ['removing /some/added/file from require cache']);
    ok(!(path in fakeRequire.cache));
  });

  it('adds removed require entries to the cache', function() {
    // Add a file to the cache.
    const path = '/some/added/file';
    fakeRequire.cache[path] = new Module(path);
    ok(path in fakeRequire.cache);

    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Remove a file from the cache.
    delete fakeRequire.cache[path];
    ok(!(path in fakeRequire.cache));

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, [
      'restoring deleted /some/added/file to require cache'
    ]);
    ok(path in fakeRequire.cache);
  });

  it('replaces modified require entries in the cache', function() {
    // Add a file to the cache.
    const path = '/some/added/file';
    const originalModule = new Module(path);
    fakeRequire.cache[path] = originalModule;
    ok(path in fakeRequire.cache);

    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Replace a file in the cache.
    fakeRequire.cache[path] = new Module(path);

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, [
      'restoring replaced /some/added/file in require cache'
    ]);
    strictEqual(fakeRequire.cache[path], originalModule);
  });

  it('removes added require extensions', function() {
    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Add a require extension.
    fakeRequire.extensions['.omg'] = () => {};

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, ['removing .omg from require extensions']);
    ok(!('.omg' in fakeRequire.extensions));
  });

  it('adds removed require extensions', function() {
    // Add a require extension.
    fakeRequire.extensions['.omg'] = () => {};

    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Remove the extension.
    delete fakeRequire.extensions['.omg'];

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, ['restoring deleted .omg to require extensions']);
    ok('.omg' in fakeRequire.extensions);
  });

  it('replaces modified require extensions', function() {
    // Add a require extension.
    const originalLoader = (): void => {};
    fakeRequire.extensions['.omg'] = originalLoader;

    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Replace a require extension.
    fakeRequire.extensions['.omg'] = () => {};

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, ['restoring replaced .omg in require extensions']);
    strictEqual(fakeRequire.extensions['.omg'], originalLoader);
  });

  it('removes added process event listeners', function() {
    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Add an event listener.
    const listener = (): void => {};
    fakeProcess.on('exit', listener);

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, [`removing all 'exit' event listeners`]);
    ok(!fakeProcess.listeners('exit').includes(listener));
  });

  it('adds removed process event listeners', function() {
    // Add an event listener.
    const listener = (): void => {};
    fakeProcess.on('exit', listener);

    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Remove the event listener.
    fakeProcess.removeListener('exit', listener);

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, [`restoring removed 'exit' event listener`]);
    ok(fakeProcess.listeners('exit').includes(listener));
  });

  it('removes an added event listener when there already is at least one', function() {
    // Start with an event listener.
    const existingListener = (): void => {};
    fakeProcess.on('exit', existingListener);

    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    // Add an event listener.
    const listener = (): void => {};
    fakeProcess.on('exit', listener);

    // Restore the snapshot.
    snapshot.restore();

    deepEqual(messages, [`removing added 'exit' event listener`]);
    deepEqual(fakeProcess.listeners('exit'), [existingListener]);
  });

  it('restores `global`', function() {
    // Take a snapshot.
    const snapshot = new ProcessSnapshot(
      fakeRequire,
      fakeProcess,
      fakeGlobal,
      log
    );

    fakeGlobal.global['foo'] = 123;

    // Restore the snapshot.
    snapshot.restore();

    strictEqual(fakeGlobal.global['foo'], undefined);
  });
});
