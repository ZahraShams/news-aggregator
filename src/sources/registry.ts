import { config } from '../config/env';
import type { SourceId } from '../types/article';
import { createGuardianSource } from './guardianSource';
import type { NewsSource } from './NewsSource';
import { createNewsApiSource } from './newsApiSource';
import { createNytSource } from './nytSource';

/** The only place sources are wired up. Adding a provider means adding a line here. */
export const sources: NewsSource[] = [
  createGuardianSource(config.guardian),
  createNytSource(config.nyt),
  createNewsApiSource(config.newsApi),
];

export const configuredSources = sources.filter((source) => source.isConfigured());

export function getSourceName(id: SourceId): string {
  return sources.find((source) => source.id === id)?.name ?? id;
}
