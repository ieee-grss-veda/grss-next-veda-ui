import { describe, expect, test } from 'vitest';
import {
  parseAttributes,
  getTransformedDatasetMetadata,
} from '../../app/content/utils/mdx';

// veda-ui's catalog search calls `.toLowerCase()` on `layer.stacCol` and
// `layer.description` without a guard, so a non-STAC layer crashes the catalog.
describe('dataset layer search fields', () => {
  test('parsing fills in the fields catalog search reads', () => {
    const parsed = parseAttributes({
      id: 'dataset-id',
      layers: [{ id: 'layer-id', name: 'Test Layer', type: 'vector-tilejson' }],
    });

    // @ts-expect-error the function is not typed yet
    const layer = parsed.layers[0];
    expect(typeof layer.stacCol).toBe('string');
    expect(typeof layer.description).toBe('string');
  });

  test('every layer in the real content is searchable without throwing', () => {
    const datasets = getTransformedDatasetMetadata();
    expect(datasets.length).toBeGreaterThan(0);

    for (const dataset of datasets) {
      for (const layer of dataset.layers ?? []) {
        expect(
          typeof layer.stacCol,
          `${dataset.id} / ${layer.id} stacCol`,
        ).toBe('string');
        expect(
          typeof layer.description,
          `${dataset.id} / ${layer.id} description`,
        ).toBe('string');
      }
    }
  });
});
