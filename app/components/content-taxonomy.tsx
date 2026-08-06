'use client';

import React from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { glsp, themeVal } from '@devseed-ui/theme-provider';
import type { StoryData } from '@lib';

/**
 * Mirrors veda-ui's internal `variableGlsp` responsive spacing helper, which
 * is not exported from the library bundle.
 */
const vglsp = (multiplier: number) => css`
  calc(${themeVal('layout.space')} * var(--base-space-multiplier, 1) *
    ${multiplier})
`;

const TaxonomySection = styled.section`
  grid-column: 1 / -1;
  padding-top: ${vglsp(0.5)};
  padding-bottom: ${vglsp(0.5)};
  box-shadow: 0 -1px 0 0 ${themeVal('color.surface-200a')};
`;

const TaxonomyList = styled.dl`
  display: flex;
  flex-flow: row wrap;
  gap: ${glsp(0.5)};
  align-items: center;

  > dd {
    display: flex;
    flex-flow: row wrap;
    gap: ${glsp(0.5)};
    margin-right: ${glsp(0.5)};
  }
`;

const TaxonomyOverline = styled.span`
  font-size: 0.75rem;
  line-height: 1rem;
  font-family: ${themeVal('type.overline.family')};
  font-weight: ${themeVal('type.overline.regular')};
  text-transform: ${themeVal('type.overline.textTransform')};
  color: ${themeVal('color.surface-400a')};
`;

const Pill = styled(Link)`
  display: inline-flex;
  vertical-align: top;
  border-radius: ${themeVal('shape.ellipsoid')};
  padding: ${glsp(0.125, 0.75)};
  transition: all 0.24s ease 0s;
  font-size: 0.75rem;
  line-height: 1.25rem;
  font-weight: ${themeVal('type.base.bold')};
  white-space: nowrap;
  color: ${themeVal('color.surface')};
  background: ${themeVal('color.surface-100a')};
  pointer-events: auto;

  &,
  &:visited {
    text-decoration: none;
  }

  &:hover {
    opacity: 0.64;
  }
`;

// Query string key the hubs' `useFiltersWithQS` reads for taxonomy filters
// (FilterActions.TAXONOMY in veda-ui).
const TAXONOMY_FILTER_KEY = 'taxonomy';

interface ContentTaxonomyProps {
  taxonomy: StoryData['taxonomy'];
  linkBase: string;
}

export default function ContentTaxonomy({
  taxonomy,
  linkBase,
}: ContentTaxonomyProps) {
  if (!taxonomy?.length) return null;

  return (
    <TaxonomySection>
      <h2 hidden>Taxonomy</h2>
      <TaxonomyList>
        {taxonomy.map(({ name, values }) => (
          <React.Fragment key={name}>
            <dt>
              <TaxonomyOverline>{name}</TaxonomyOverline>
            </dt>
            <dd>
              {values.map((t) => (
                <Pill
                  key={t.id}
                  href={`${linkBase}?${TAXONOMY_FILTER_KEY}=${encodeURIComponent(
                    JSON.stringify({ [name]: t.id }),
                  )}`}
                >
                  {t.name}
                </Pill>
              ))}
            </dd>
          </React.Fragment>
        ))}
      </TaxonomyList>
    </TaxonomySection>
  );
}
