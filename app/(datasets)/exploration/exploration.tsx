'use client';
import React, { useState, useEffect } from 'react';
import {
  ExplorationAndAnalysis,
  DatasetSelectorModal,
  useTimelineDatasetAtom,
  externalDatasetsAtom,
} from '@lib';
import { useSetAtom } from 'jotai';
import VizAppShell from 'app/viz-apps/shell';
import { useTheme } from 'app/components/common/theme-provider';

export default function ExplorationAnalysis({ datasets }: { datasets: any }) {
  const setExternalDatasets = useSetAtom(externalDatasetsAtom);
  const { theme } = useTheme();

  setExternalDatasets(datasets);

  const [timelineDatasets, setTimelineDatasets] = useTimelineDatasetAtom();
  const [datasetModalRevealed, setDatasetModalRevealed] = useState(
    !timelineDatasets.length,
  );

  const openModal = () => setDatasetModalRevealed(true);
  const closeModal = () => setDatasetModalRevealed(false);

  // Add veda-ui-root data attribute and dark mode class to modal portal when it mounts.
  useEffect(() => {
    if (!datasetModalRevealed) return;

    const timeoutId = setTimeout(() => {
      const modalWrapper = document.querySelector('[class*="styled__ModalWrapper"]');
      if (modalWrapper) {
        modalWrapper.setAttribute('data-veda-ui-root', 'true');
        if (!modalWrapper.classList.contains('veda-ui-scope')) {
          modalWrapper.classList.add('veda-ui-scope');
        }
        if (theme === 'dark') {
          modalWrapper.classList.add('dark');
        } else {
          modalWrapper.classList.remove('dark');
        }
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [datasetModalRevealed, theme]);

  return (
    <VizAppShell datasets={datasets}>
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
    </VizAppShell>
  );
}
