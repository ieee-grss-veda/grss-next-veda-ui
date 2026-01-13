'use client';
import React, { useState, useEffect } from 'react';
import {
  ExplorationAndAnalysis,
  DatasetSelectorModal,
  useTimelineDatasetAtom,
  externalDatasetsAtom,
  LegacyGlobalStyles,
} from '@lib';
import { useSetAtom } from 'jotai';
import useElementHeight from '@utils/hooks/use-element-height';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';
import { useTheme } from 'app/components/common/theme-provider';

export default function ExplorationAnalysis({ datasets }: { datasets: any }) {
  const setExternalDatasets = useSetAtom(externalDatasetsAtom);
  const { theme } = useTheme();

  setExternalDatasets(datasets);

  const [timelineDatasets, setTimelineDatasets] = useTimelineDatasetAtom();
  const [datasetModalRevealed, setDatasetModalRevealed] = useState(
    !timelineDatasets.length,
  );

  const openModal = () => {
    setDatasetModalRevealed(true);
  };
  const closeModal = () => {
    setDatasetModalRevealed(false);
  };

  // Add veda-ui-scope and dark mode class to modal portal when it mounts
  useEffect(() => {
    if (!datasetModalRevealed) return;

    // Small delay to ensure modal has rendered to DOM
    const timeoutId = setTimeout(() => {
      // Find the modal wrapper container (class starts with styled__ModalWrapper)
      const modalWrapper = document.querySelector('[class*="styled__ModalWrapper"]');
      if (modalWrapper) {
        // Add veda-ui-scope class for styling
        if (!modalWrapper.classList.contains('veda-ui-scope')) {
          modalWrapper.classList.add('veda-ui-scope');
        }
        // Sync dark mode class with current theme
        if (theme === 'dark') {
          modalWrapper.classList.add('dark');
        } else {
          modalWrapper.classList.remove('dark');
        }
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [datasetModalRevealed, theme]);
  // On landing, measure the height of Header and fill up the rest of the space with E&A
  const offsetHeight = useElementHeight({ queryToSelect: 'header' });

  return (
    <VedaUIWrapper datasets={datasets}>
      <div
        id='ea-wrapper'
        // The below styles adjust the E&A page to match what we have on earthdata.nasa.gov
        // E&A is supposed to fill up whichever space given
        // Adjusting the container's height so the page with E&A doesn't overflow.
        style={{
          width: '100%',
          height: `calc(100vh - ${offsetHeight}px)`,
        }}
      >
        <DatasetSelectorModal
          revealed={datasetModalRevealed}
          close={closeModal}
          timelineDatasets={timelineDatasets}
          setTimelineDatasets={setTimelineDatasets}
          datasets={datasets}
        />
        <ExplorationAndAnalysis
          datasets={timelineDatasets}
          setDatasets={setTimelineDatasets}
          openDatasetsSelectionModal={openModal}
        />
      </div>
    </VedaUIWrapper>
  );
}
