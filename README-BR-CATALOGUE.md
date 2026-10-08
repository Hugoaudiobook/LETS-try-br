# Brazilian Portuguese Anime Catalogue

This fork adds a standalone catalogue at `site/`.

## Features
- Starts with the entire Brazilian Portuguese dub catalogue visible.
- 25 anime per page in a responsive grid.
- Search excludes non-matching titles.
- Filters for year, episode count, episode duration, genre and format.
- Sorting by title, year, episodes and duration.
- English/romaji and Japanese/native titles are displayed without requiring a detail page.
- Metadata is built from MyDubList Portuguese (BR) IDs and AniList.

## Build
Run the GitHub Actions workflow **Build catalogue** manually once. It also runs daily and commits the generated `site/data/anime.json`.

The dub dataset remains under the MyDubList CC BY 4.0 attribution requirements.
