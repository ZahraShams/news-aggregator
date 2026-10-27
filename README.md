# News Aggregator

A news reader that brings articles from **The Guardian**, **The New York Times** and
**NewsAPI.org** into one timeline. Built with React 19, TypeScript and Vite.

## Features

**Search and filtering (Explore tab)**
- Keyword search across all sources, sent once you stop typing
- Filter by category, date (today, past week, past month or a custom range) and source

**Personalized feed (For you tab)**
- Choose your preferred sources, categories and authors
- Follow an author straight from any article
- Articles by followed authors are highlighted and shown first, with an option to show only them
- Preferences are saved in the browser

**Mobile-friendly**
- One column on phones, two on tablets, three on desktop
- Filters fold behind a button on small screens, and preferences open as a bottom sheet
- Dark mode follows the system setting

Also: if one source fails, the others still show, with a message for the failed one.
Results from different sources are merged, sorted newest first and de-duplicated.

## API keys

All three keys are free:

| Source | Sign up | Variable |
| --- | --- | --- |
| The Guardian | https://open-platform.theguardian.com/access/ | `VITE_GUARDIAN_KEY` |
| The New York Times | https://developer.nytimes.com/get-started (enable the **Article Search API**) | `VITE_NYT_KEY` |
| NewsAPI | https://newsapi.org/register | `VITE_NEWSAPI_KEY` |

Copy the example file and add your keys:

```bash
cp .env.example .env
```

A source without a key is shown as disabled; the app works with the others.

## Run with Docker

```bash
docker compose up --build
```

Then open http://localhost:8080.

Without Compose:

```bash
docker build -t news-aggregator .
docker run --rm -p 8080:80 --env-file .env news-aggregator
```

The image is built in two stages: Node 26 installs dependencies, runs the tests and builds
the app, then nginx serves the static files. The API keys are **not** built into the image.
When the container starts, `docker/entrypoint.sh` writes them from the environment into
`config.js`, so the same image can run with different keys.

## Run locally

Requires Node 26 (see `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests
npm run lint
npm run build    # type check and production build
```

## Project structure

```
src/
├── types/article.ts       Article and ArticleQuery: the shape all sources are converted into
├── sources/
│   ├── NewsSource.ts      Interface every source implements
│   ├── guardianSource.ts  ┐
│   ├── nytSource.ts       ├ One adapter per API: builds the request, converts the response
│   ├── newsApiSource.ts   ┘
│   └── registry.ts        The one place sources are connected to the app
├── services/
│   ├── aggregator.ts      Fetches sources in parallel, merges, de-duplicates, sorts
│   └── personalize.ts     Matches and prioritizes followed authors
├── hooks/                 useArticles (loading, cancelling, paging), useDebounce, usePreferences
├── context/               Preferences state, saved to localStorage
├── components/            UI components
├── config/env.ts          Reads API keys from the container or from .env
└── utils/                 HTTP with caching, dates, formatting, safe storage
```

## Design decisions

- **One interface for all sources.** Each API is wrapped in an adapter that implements
  `NewsSource` and converts its response into the shared `Article` type. The rest of the
  app never sees API-specific data. Adding a source (for example BBC News) means writing
  one adapter and adding one line to `registry.ts`.
- **Dependencies are passed in.** Adapters receive their API key, and the aggregator
  receives the sources it works with. This keeps them easy to test with fake data.
- **Failures stay contained.** Sources are fetched with `Promise.allSettled`, so a slow or
  failing API never blanks the page.
- **API differences are handled inside the adapters.** NYT counts pages from 0 and wants
  dates as `YYYYMMDD`. NewsAPI's `top-headlines` endpoint supports categories but not
  dates, and `everything` supports dates but not categories, so the adapter picks one per
  query.
- **Shared components.** The source and category pickers are used both by the Explore
  filters and the preferences dialog.
- **No extra libraries.** React state and context, and plain CSS with custom properties, are
  enough for an app this size.

## Known limitations

- **NYT rate limit.** The free NYT plan allows 5 requests a minute. A feed with several
  categories sends one request per category, so it can hit the limit; NYT then shows an
  error while the other sources keep working. Responses are cached for 5 minutes to
  reduce this.
- **NewsAPI and dates.** With a date filter, NewsAPI cannot filter by category, so the
  category is added to the search words instead. These results are less precise.
- **NewsAPI only works from localhost** on its free plan, which blocks browser requests
  from other domains. Running the app on localhost (dev server or Docker) works.
- **API keys are visible in the browser.** Any key used by front-end code can be read
  by the user. A production version would call the APIs through a small backend that
  keeps the keys secret.
