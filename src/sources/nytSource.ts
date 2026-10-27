import type { Article, ArticleQuery, Category } from '../types/article';
import { buildUrl, getJson } from '../utils/http';
import type { NewsSource, SourceConfig, SourceResult } from './NewsSource';

const IMAGE_HOST = 'https://www.nytimes.com/';
/** NYT returns a fixed 10 results per page and serves at most 100 pages. */
const PAGE_SIZE = 10;
const MAX_PAGES = 100;

/** Our categories mapped to NYT section names. */
const SECTIONS: Record<Category, string> = {
  business: 'Business',
  technology: 'Technology',
  science: 'Science',
  health: 'Health',
  sports: 'Sports',
  entertainment: 'Arts',
  politics: 'U.S.',
};

type NytImage = { url: string; subtype?: string };

/** The API has used two shapes for images: an array, and later an object. */
type NytMultimedia =
  | NytImage[]
  | { default?: { url: string }; thumbnail?: { url: string } }
  | null;

export interface NytDoc {
  _id: string;
  web_url: string;
  headline: { main: string };
  abstract?: string;
  snippet?: string;
  pub_date: string;
  section_name?: string;
  byline?: { original?: string | null };
  multimedia?: NytMultimedia;
}

interface NytResponse {
  response: {
    docs: NytDoc[] | null;
    meta?: { hits: number };
    metadata?: { hits: number };
  };
}

function pickImage(multimedia: NytMultimedia | undefined): string | undefined {
  if (!multimedia) return undefined;

  if (Array.isArray(multimedia)) {
    const image = multimedia.find((m) => m.subtype === 'xlarge') ?? multimedia[0];
    if (!image) return undefined;
    // Older responses use paths relative to nytimes.com.
    return image.url.startsWith('http') ? image.url : IMAGE_HOST + image.url;
  }

  return multimedia.default?.url ?? multimedia.thumbnail?.url;
}

/** "2026-10-27" -> "20261027" */
const toNytDate = (date?: string) => date?.replaceAll('-', '');

export function buildNytUrl(query: ArticleQuery, apiKey: string, baseUrl: string): string {
  return buildUrl(baseUrl, 'articlesearch.json', {
    q: query.keyword,
    fq: query.category && `section.name:"${SECTIONS[query.category]}"`,
    begin_date: toNytDate(query.from),
    end_date: toNytDate(query.to),
    // Our pages start at 1, NYT pages start at 0.
    page: query.page - 1,
    sort: 'newest',
    'api-key': apiKey,
  });
}

export function mapNytDoc(doc: NytDoc): Article {
  return {
    id: `nyt:${doc._id}`,
    title: doc.headline.main,
    description: doc.abstract || doc.snippet || '',
    url: doc.web_url,
    imageUrl: pickImage(doc.multimedia),
    author: doc.byline?.original ?? undefined,
    publishedAt: doc.pub_date,
    source: 'nyt',
    outlet: 'The New York Times',
    category: doc.section_name,
  };
}

export function createNytSource({ apiKey, baseUrl }: SourceConfig): NewsSource {
  return {
    id: 'nyt',
    name: 'The New York Times',
    isConfigured: () => Boolean(apiKey),

    async fetchArticles(query, signal): Promise<SourceResult> {
      if (!apiKey) return { articles: [], hasMore: false };

      const { response } = await getJson<NytResponse>('nyt', buildNytUrl(query, apiKey, baseUrl), signal);
      const hits = response.metadata?.hits ?? response.meta?.hits ?? 0;
      return {
        articles: (response.docs ?? []).map(mapNytDoc),
        hasMore: query.page < MAX_PAGES && query.page * PAGE_SIZE < hits,
      };
    },
  };
}
