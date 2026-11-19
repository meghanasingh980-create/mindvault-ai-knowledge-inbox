
import test from 'node:test';
import assert from 'node:assert/strict';

const API = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function getStatus(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  return response.status;
}

function postJson(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

test('rejects an empty note', async () => {
  assert.equal(
    await getStatus('/ingest', postJson({ type: 'note', content: '' })),
    400
  );
});

test('rejects an empty URL', async () => {
  assert.equal(
    await getStatus('/ingest', postJson({ type: 'url', url: '' })),
    400
  );
});

test('rejects an invalid content type', async () => {
  assert.equal(
    await getStatus('/ingest', postJson({ type: 'image', content: 'test' })),
    400
  );
});

test('rejects an empty question', async () => {
  assert.equal(
    await getStatus('/query', postJson({ question: '' })),
    400
  );
});

test('rejects questions longer than 2000 characters', async () => {
  assert.equal(
    await getStatus('/query', postJson({ question: 'a'.repeat(2001) })),
    400
  );
});

test('rejects an invalid DELETE ID', async () => {
  assert.equal(await getStatus('/items/abc', { method: 'DELETE' }), 400);
});

test('returns 404 for a nonexistent item', async () => {
  assert.equal(
    await getStatus('/items/999999999', { method: 'DELETE' }),
    404
  );
});

test('returns 404 for an unknown route', async () => {
  assert.equal(await getStatus('/unknown'), 404);
});
