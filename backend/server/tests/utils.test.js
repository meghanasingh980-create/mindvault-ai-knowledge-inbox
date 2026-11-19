
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { chunkText } from "../src/utils/chunkText.js";
import { cosineSimilarity } from "../src/utils/cosineSimilarity.js";

describe("chunkText", () => {
  it("returns an empty array for empty input", () => {
    assert.deepEqual(chunkText(""), []);
    assert.deepEqual(chunkText("   "), []);
  });

  it("normalizes whitespace", () => {
    assert.deepEqual(chunkText("Hello   world\nagain"), [
      "Hello world again",
    ]);
  });

  it("splits long text into multiple chunks", () => {
    const result = chunkText(
      "alpha beta gamma delta epsilon zeta eta theta",
      15,
      3
    );

    assert.ok(result.length > 1);
    assert.ok(result.every(chunk => chunk.length <= 15));
  });

  it("rejects invalid chunk configurations", () => {
    assert.throws(() => chunkText("hello", 0, 0));
    assert.throws(() => chunkText("hello", 10, 10));
    assert.throws(() => chunkText("hello", 10, -1));
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    assert.equal(
      cosineSimilarity([1, 0], [1, 0]),
      1
    );
  });

  it("returns 0 for perpendicular vectors", () => {
    assert.equal(
      cosineSimilarity([1, 0], [0, 1]),
      0
    );
  });

  it("returns -1 for opposite vectors", () => {
    assert.equal(
      cosineSimilarity([1, 0], [-1, 0]),
      -1
    );
  });

  it("returns 0 when a vector has zero magnitude", () => {
    assert.equal(
      cosineSimilarity([0, 0], [1, 1]),
      0
    );
  });

  it("rejects invalid vectors", () => {
    assert.throws(() => cosineSimilarity([], []));
    assert.throws(() => cosineSimilarity([1, 2], [1]));
    assert.throws(() => cosineSimilarity("abc", [1, 2]));
  });
});
