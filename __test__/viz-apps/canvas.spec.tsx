import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const addControlMock = vi.fn();
const removeMock = vi.fn();
const onLoadMock = vi.fn();
const jumpToMock = vi.fn();

// Captured load callback + a fake style returned by getStyle().
// Tests can call `fireMapLoad()` after mount to simulate the basemap loading.
let capturedLoadCb: (() => void) | undefined;
let mockStyle: { layers: Array<{ id: string; type: string }> } = { layers: [] };
function fireMapLoad() {
  capturedLoadCb?.();
}

// Mock maplibre-gl Map.
vi.mock('maplibre-gl', () => {
  class MockMap {
    constructor(public opts: any) {}
    addControl = addControlMock;
    on = (evt: string, cb: () => void) => {
      if (evt === 'load') {
        onLoadMock(cb);
        capturedLoadCb = cb;
      }
    };
    remove = removeMock;
    jumpTo = jumpToMock;
    getStyle = () => mockStyle;
  }
  return { default: { Map: MockMap }, Map: MockMap };
});

const setPropsMock = vi.fn();
const overlayCtorMock = vi.fn();

// Mock @deck.gl/mapbox MapboxOverlay.
vi.mock('@deck.gl/mapbox', () => {
  class MockOverlay {
    constructor(opts: any) {
      overlayCtorMock(opts);
    }
    setProps = setPropsMock;
    onAdd() {}
    onRemove() {}
  }
  return { MapboxOverlay: MockOverlay };
});

import { DeckglMaplibreCanvas } from '../../app/viz-apps/shared/deckgl-maplibre/canvas';

describe('DeckglMaplibreCanvas', () => {
  beforeEach(() => {
    addControlMock.mockClear();
    removeMock.mockClear();
    onLoadMock.mockClear();
    jumpToMock.mockClear();
    setPropsMock.mockClear();
    overlayCtorMock.mockClear();
    capturedLoadCb = undefined;
    mockStyle = { layers: [] };
  });

  test('mounts MapLibre and attaches a MapboxOverlay with the given layers', () => {
    const fakeLayers = [{ id: 'layer-a' } as any, { id: 'layer-b' } as any];
    render(<DeckglMaplibreCanvas layers={fakeLayers} />);
    expect(overlayCtorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        interleaved: true,
        layers: fakeLayers,
      }),
    );
    expect(addControlMock).toHaveBeenCalled();
  });

  test('renders overlayChildren inside the canvas container', () => {
    render(
      <DeckglMaplibreCanvas
        layers={[]}
        overlayChildren={<div data-testid='overlay'>Hello</div>}
      />,
    );
    // getByTestId throws if not found, so reaching this line is the assertion.
    expect(screen.getByTestId('overlay').textContent).toBe('Hello');
  });

  test('renders an inline error message when status.error is set', () => {
    render(
      <DeckglMaplibreCanvas
        layers={[]}
        status={{ error: "Couldn't load tiles" }}
      />,
    );
    expect(screen.getByText(/Couldn't load tiles/).textContent).toMatch(
      /Couldn't load tiles/,
    );
  });

  test('updates overlay layers when the layers prop changes', () => {
    const { rerender } = render(<DeckglMaplibreCanvas layers={[{ id: 'a' } as any]} />);
    rerender(<DeckglMaplibreCanvas layers={[{ id: 'b' } as any]} />);
    expect(setPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ layers: [{ id: 'b' }] }),
    );
  });

  test('jumps to the initialViewState when it arrives after mount', () => {
    const { rerender } = render(<DeckglMaplibreCanvas layers={[]} />);
    expect(jumpToMock).not.toHaveBeenCalled();

    rerender(
      <DeckglMaplibreCanvas
        layers={[]}
        initialViewState={{ longitude: 5, latitude: -3, zoom: 7 }}
      />,
    );
    expect(jumpToMock).toHaveBeenCalledWith({
      center: [5, -3],
      zoom: 7,
    });

    // Subsequent changes should not re-jump (would clobber user pan/zoom).
    jumpToMock.mockClear();
    rerender(
      <DeckglMaplibreCanvas
        layers={[]}
        initialViewState={{ longitude: 10, latitude: 10, zoom: 10 }}
      />,
    );
    expect(jumpToMock).not.toHaveBeenCalled();
  });

  test('does not jump when the canvas mounts already with a non-default view', () => {
    render(
      <DeckglMaplibreCanvas
        layers={[]}
        initialViewState={{ longitude: 5, latitude: 5, zoom: 5 }}
      />,
    );
    expect(jumpToMock).not.toHaveBeenCalled();
  });

  test('after the basemap loads, layers are cloned with beforeId pointing at the first symbol layer', () => {
    mockStyle = {
      layers: [
        { id: 'background', type: 'background' },
        { id: 'water', type: 'fill' },
        { id: 'place_labels', type: 'symbol' },
        { id: 'road_labels', type: 'symbol' },
      ],
    };

    const cloneMock = vi.fn((newProps: any) => ({ id: 'cloned', ...newProps }));
    const fakeLayer = { id: 'orig', clone: cloneMock };

    render(<DeckglMaplibreCanvas layers={[fakeLayer as any]} />);

    // Before load fires, layers go in as-is.
    expect(setPropsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ layers: [fakeLayer] }),
    );
    expect(cloneMock).not.toHaveBeenCalled();

    // Simulate basemap finishing loading.
    act(() => {
      fireMapLoad();
    });

    expect(cloneMock).toHaveBeenCalledWith({ beforeId: 'place_labels' });
    expect(setPropsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        layers: [expect.objectContaining({ beforeId: 'place_labels' })],
      }),
    );
  });

  test('leaves layers untouched if the basemap has no symbol layers', () => {
    mockStyle = {
      layers: [
        { id: 'background', type: 'background' },
        { id: 'water', type: 'fill' },
      ],
    };

    const cloneMock = vi.fn();
    const fakeLayer = { id: 'orig', clone: cloneMock };

    render(<DeckglMaplibreCanvas layers={[fakeLayer as any]} />);
    act(() => {
      fireMapLoad();
    });

    expect(cloneMock).not.toHaveBeenCalled();
    expect(setPropsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ layers: [fakeLayer] }),
    );
  });
});
