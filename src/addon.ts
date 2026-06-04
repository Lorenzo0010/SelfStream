const { addonBuilder } = require('stremio-addon-sdk');
import { getVixSrcStreams } from './vixsrc';
import { getVixCloudStreams } from './vixcloud';
// [CinemaCity disabled — Cloudflare bypass no longer viable]
// import { getCinemaCityStreams, extractFreshStreamUrl, FreshStream, SubtitleTrack } from './cinemacity';
import { decodeProxyToken, resolveUrl, makeProxyToken, getAddonBase } from './proxy';
import { decodeConfig, UserConfig, DEFAULT_CONFIG } from './config';
import { request } from 'undici';
import { pipeline } from 'stream/promises';
const express = require('express');
import { generateLandingPage } from './landing';
import { getTvMetas, getTvStreams } from './live';

// Map subtitle label names to BCP-47 language codes for HLS LANGUAGE attribute
const LABEL_TO_LANG: Record<string, string> = {
    'arabic': 'ar', 'العربية': 'ar',
    'bulgarian': 'bg', 'български': 'bg',
    'cantonese': 'yue', '廣東話': 'yue',
    'catalan': 'ca', 'català': 'ca',
    'chinese-simplified': 'zh-Hans', '中文 (简体)': 'zh-Hans', '中文(简体)': 'zh-Hans',
    'chinese-traditional': 'zh-Hant', '中文 (繁體)': 'zh-Hant', '中文(繁體)': 'zh-Hant',
    'croatian': 'hr', 'hrvatski': 'hr',
    'czech': 'cs', 'čeština': 'cs',
    'danish': 'da', 'dansk': 'da',
    'dutch': 'nl', 'nederlands': 'nl',
    'english': 'en',
    'estonian': 'et', 'eesti': 'et',
    'filipino': 'fil',
    'finnish': 'fi', 'suomi': 'fi',
    'french': 'fr', 'français': 'fr',
    'galician': 'gl', 'galego': 'gl',
    'german': 'de', 'deutsch': 'de',
    'greek': 'el', 'ελληνικά': 'el',
    'hebrew': 'he', 'עברית': 'he',
    'hindi': 'hi', 'हिन्दी': 'hi',
    'hungarian': 'hu', 'magyar': 'hu',
    'icelandic': 'is', 'íslenska': 'is',
    'indonesian': 'id', 'bahasa indonesia': 'id',
    'italian': 'it', 'italiano': 'it',
    'japanese': 'ja', '日本語': 'ja',
    'kannada': 'kn', 'ಕನ್ನಡ': 'kn',
    'korean': 'ko', '한국어': 'ko',
    'latvian': 'lv', 'latviešu': 'lv',
    'lithuanian': 'lt', 'lietuvių': 'lt',
    'malay': 'ms', 'bahasa melayu': 'ms',
    'malayalam': 'ml', 'മലയാളം': 'ml',
    'norwegian': 'no', 'norsk': 'no',
    'polish': 'pl', 'polski': 'pl',
    'portuguese': 'pt', 'português': 'pt',
    'romanian': 'ro', 'română': 'ro',
    'russian': 'ru', 'русский': 'ru',
    'serbian': 'sr', 'srpski': 'sr',
    'slovak': 'sk', 'slovenčina': 'sk',
    'slovenian': 'sl', 'slovenščina': 'sl',
    'spanish': 'es', 'español': 'es',
    'swedish': 'sv', 'svenska': 'sv',
    'tamil': 'ta', 'தமிழ்': 'ta',
    'telugu': 'te', 'తెలుగు': 'te',
    'thai': 'th', 'ไทย': 'th',
    'turkish': 'tr', 'türkçe': 'tr',
    'ukrainian': 'uk', 'українська': 'uk',
    'vietnamese': 'vi', 'tiếng việt': 'vi',
};

function guessLangCode(label: string): string {
    const lower = label.toLowerCase().replace(/\s*\(.*$/, '').trim();
    if (LABEL_TO_LANG[lower]) return LABEL_TO_LANG[lower];
    // Try matching just the first word
    const firstWord = lower.split(/[\s(-]/)[0];
    if (LABEL_TO_LANG[firstWord]) return LABEL_TO_LANG[firstWord];
    // Check if label contains a known language name
    for (const [key, code] of Object.entries(LABEL_TO_LANG)) {
        if (lower.includes(key)) return code;
    }
    return 'und';
}

const manifest = {
    id: 'org.selfstream.addon',
    version: '1.2.0',
    name: 'SelfStream🤌',
    description: 'SelfStream - Multi-source streaming addon with Live TV',
    logo: 'https://icv.stremio.dpdns.org/prisonmike.png',
    background: 'https://blog.stremio.com/wp-content/uploads/2022/08/shino-1024x632.png',
    resources: ['stream', 'catalog', { name: 'meta', types: ['tv'] }],
    types: ['movie', 'series', 'anime', 'tv'],
    idPrefixes: ['tmdb:', 'tt', 'kitsu:', 'tv:'],
    catalogs: [
        {
            id: 'selfstream_tv',
            type: 'tv',
            name: 'SelfStream TV 📺',
            extra: [
                {
                    name: 'genre',
                    isRequired: true,
                    options: ['RAI', 'Mediaset', 'Sky', 'Sport', 'News', 'Bambini', 'Generali', 'Discovery', 'Cinema', 'Documentari', 'Pluto']
                }
            ]
        }
    ]
};

const builder = new addonBuilder(manifest as any);

// Stream handler that uses user config to decide which sources to query
async function handleStream(type: string, id: string, userConfig: UserConfig): Promise<any[]> {
    const allStreams: any[] = [];

    try {
        // ── Live TV ──
        if (type === 'tv') {
            const rawId = id.startsWith('tv:') ? id.slice(3) : id;
            return [{ _tvChannelId: rawId }];
        }

        // ── Kitsu (AnimeUnity/VixCloud) ──
        if (id && id.startsWith('kitsu:')) {
            if (userConfig.animeunityEnabled) {
                const parts = id.split(':');
                const kitsuId = parts[1];
                const episodeNum = parts[2] || '1';
                const streams = await getVixCloudStreams(kitsuId, episodeNum);
                allStreams.push(...streams);
            }
            return allStreams;
        }

        if (type === 'movie' || type === 'series') {
            let tmdbId = id;
            let season: string | undefined;
            let episode: string | undefined;

            if (type === 'movie') {
                if (id.startsWith('tmdb:')) {
                    tmdbId = id.split(':')[1];
                }
            } else if (type === 'series') {
                const parts = id.split(':');
                if (parts[0] === 'tmdb') {
                    tmdbId = parts[1];
                    season = parts[2];
                    episode = parts[3];
                } else if (parts[0].startsWith('tt')) {
                    tmdbId = parts[0];
                    season = parts[1];
                    episode = parts[2];
                }
            }

            // Fetch localized title from TMDB once for all sources
            let mediaTitle = '';
            try {
                const TMDB_KEY = Buffer.from('MTg2NWY0M2EwNTQ5Y2E1MGQzNDFkZDlhYjhiMjlmNDk=', 'base64').toString();
                const tmdbType = type === 'series' ? 'tv' : 'movie';
                // Pick the best lang between vix and cc (prefer whichever is enabled)
                const titleLang = userConfig.vixEnabled ? userConfig.vixLang : 'en';
                if (tmdbId.startsWith('tt')) {
                    const resp = await fetch(`https://api.themoviedb.org/3/find/${tmdbId}?api_key=${TMDB_KEY}&external_source=imdb_id&language=${titleLang}`);
                    const data = await resp.json() as any;
                    const r = data?.movie_results?.[0] || data?.tv_results?.[0];
                    mediaTitle = r?.title || r?.name || '';
                } else {
                    const resp = await fetch(`https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${TMDB_KEY}&language=${titleLang}`);
                    const data = await resp.json() as any;
                    mediaTitle = data?.title || data?.name || '';
                }
            } catch { /* proceed without title */ }

            // ── VixSrc ──
            if (userConfig.vixEnabled) {
                try {
                    const vixStreams = await getVixSrcStreams(tmdbId, season, episode, userConfig.vixLang);
                    for (const s of vixStreams) {
                        s.name = 'VixSrc 🤌';
                        s.title = `🎬 ${mediaTitle || 'Stream'}`;
                    }
                    allStreams.push(...vixStreams);
                } catch (err) {
                    console.error("[VixSrc] error:", err);
                }
            }

            // ── CinemaCity [DISABLED — Cloudflare bypass no longer viable] ──
            // if (userConfig.cinemacityEnabled) {
            //     try {
            //         const ccStreams = await getCinemaCityStreams(tmdbId, type, season, episode, userConfig.cinemacityLang);
            //         for (const s of ccStreams) {
            //             s.name = 'CinemaCity 🤌';
            //             s.title = `🎬 ${mediaTitle || 'Stream'}`;
            //         }
            //         allStreams.push(...ccStreams);
            //     } catch (err) {
            //         console.error("[CinemaCity] error:", err);
            //     }
            // }
        }
    } catch (err) {
        console.error("Handler error:", err);
    }

    return allStreams;
}

// ── TV Catalog Handler ──
const builderWithCatalog = builder as any;
if (typeof builderWithCatalog.defineCatalogHandler === 'function') {
    builderWithCatalog.defineCatalogHandler(async ({ type, id, extra }: { type: string; id: string; extra?: any }) => {
        if (type !== 'tv') return { metas: [] };
        const genre = extra?.genre;
        return { metas: getTvMetas(genre), cacheMaxAge: 3600 };
    });
}

builder.defineStreamHandler(async (args: any) => {
    let type = args.type;
    let id = args.id;

    if (typeof type === 'object' && type.id) {
        id = type.id;
        type = type.type;
    }

    console.log("Stream request (default config):", { type, id });
    const streams = await handleStream(type, id, DEFAULT_CONFIG);
    return { streams };
});

const addonInterface = builder.getInterface();

const app = express();
app.set('trust proxy', true);
app.use((req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

// ── TV Catalog Endpoint ──
app.get('/catalog/tv/:id.json', (req: any, res: any) => {
    const genre = req.query.genre;
    res.json({ metas: getTvMetas(genre), cacheMaxAge: 3600 });
});
app.get('/:config/catalog/tv/:id.json', (req: any, res: any) => {
    const genre = req.query.genre;
    res.json({ metas: getTvMetas(genre), cacheMaxAge: 3600 });
});

// ── TV Meta Handler ──
app.get('/meta/tv/:id.json', (req: any, res: any) => {
    const { TV_CHANNELS, getChannelGenre } = require('./live');
    const rawId = req.params.id.startsWith('tv:') ? req.params.id.slice(3) : req.params.id;
    const ch = TV_CHANNELS.find((c: any) => c.id === rawId);
    if (!ch) return res.status(404).json({ meta: null });
    res.json({
        meta: {
            id: 'tv:' + ch.id,
            type: 'tv',
            name: ch.name,
            poster: ch.poster || ch.logo || '',
            logo: ch.logo || ch.poster || '',
            background: ch.background || '',
            description: ch.description || '',
            genres: [getChannelGenre(ch)],
        }
    });
});

// ── Landing Page ──
app.get('/', (req: any, res: any) => {
    const addonBase = getAddonBase(req);
    res.send(generateLandingPage(manifest, addonBase));
});

// ── Manifest (default config) ──
app.get('/manifest.json', (req: any, res: any) => {
    res.json(manifest);
});

// ── Manifest (with user config) ──
app.get('/:config/manifest.json', (req: any, res: any) => {
    res.json(manifest);
});

// ── Stream Endpoint: with user config ──
app.get('/:config/stream/:type/:id.json', async (req: any, res: any) => {
    const { config: configToken, type, id } = req.params;
    const addonBase = getAddonBase(req);
    const userConfig = decodeConfig(configToken);

    console.log("Stream request (configured):", { type, id, userConfig });

    try {
        const streams = await handleStream(type, id, userConfig);
        const fixed = streams.flatMap((s: any) => {
            if (s._tvChannelId) return getTvStreams(s._tvChannelId, addonBase);
            if (s.url && s.url.startsWith('/')) s.url = `${addonBase}${s.url}`;
            return s;
        });
        res.json({ streams: fixed });
    } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Internal Error' });
    }
});

// ── Stream Endpoint: default config (backward compat) ──
app.get('/stream/:type/:id.json', async (req: any, res: any) => {
    const { type, id } = req.params;
    const addonBase = getAddonBase(req);

    try {
        const streams = await handleStream(type, id, DEFAULT_CONFIG);
        const fixed = streams.flatMap((s: any) => {
            if (s._tvChannelId) return getTvStreams(s._tvChannelId, addonBase);
            if (s.url && s.url.startsWith('/')) s.url = `${addonBase}${s.url}`;
            return s;
        });
        res.json({ streams: fixed });
    } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Internal Error' });
    }
});

// ── CinemaCity Lazy Proxy [DISABLED — Cloudflare bypass no longer viable] ──
// Entire /proxy/cc/ endpoint commented out.
/*
app.get('/proxy/cc/manifest.m3u8', async (req: any, res: any) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).send('#EXTM3U\n# Missing token');

        let decoded: any;
        try {
            decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
        } catch {
            return res.status(400).send('#EXTM3U\n# Invalid token');
        }

        const pageUrl = decoded?.page;
        if (!pageUrl) return res.status(400).send('#EXTM3U\n# Missing page URL');

        const season = decoded?.s || undefined;
        const episode = decoded?.e || undefined;
        const preferredLang = decoded?.lang || 'en';

        // Scrape the page NOW to get a fresh CDN URL
        const freshStream = await extractFreshStreamUrl(pageUrl, season, episode);
        if (!freshStream) {
            return res.status(502).send('#EXTM3U\n# Failed to resolve stream from CinemaCity');
        }

        const freshUrl = freshStream.url;
        const streamHeaders = freshStream.headers;
        const addonBase = getAddonBase(req);

        // If it's an HLS stream, fetch and rewrite it through the standard proxy
        if (freshUrl.includes('.m3u8')) {
            console.log(`[CC Proxy] Fetching HLS: ${freshUrl.substring(0, 80)}...`);
            const { body, statusCode } = await request(freshUrl, { headers: streamHeaders });
            if (statusCode !== 200) {
                return res.status(502).send(`#EXTM3U\n# CDN error ${statusCode}`);
            }

            const text = await body.text();

            // If master playlist, pick only the best resolution variant
            if (text.includes('#EXT-X-STREAM-INF:')) {
                const lines2 = text.split(/\r?\n/);
                const variants: { info: string; url: string; height: number; bandwidth: number }[] = [];
                for (let j = 0; j < lines2.length; j++) {
                    if (lines2[j].startsWith('#EXT-X-STREAM-INF:')) {
                        const next = lines2[j + 1];
                        if (next && !next.startsWith('#')) {
                            let height = 0, bandwidth = 0;
                            const hm = lines2[j].match(/RESOLUTION=\d+x(\d+)/i);
                            if (hm) height = parseInt(hm[1]);
                            const bm = lines2[j].match(/BANDWIDTH=(\d+)/i);
                            if (bm) bandwidth = parseInt(bm[1]);
                            variants.push({ info: lines2[j], url: resolveUrl(freshUrl, next.trim()), height, bandwidth });
                            j++;
                        }
                    }
                }
                if (variants.length > 0) {
                    variants.sort((a, b) => (b.height - a.height) || (b.bandwidth - a.bandwidth));
                    const best2 = variants[0];
                    const token2 = makeProxyToken(best2.url, streamHeaders);
                    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
                    return res.send(`#EXTM3U\n${best2.info}\n${addonBase}/proxy/hls/manifest.m3u8?token=${token2}\n`);
                }
            }

            // Single-rendition playlist — rewrite segments
            const lines2 = text.split(/\r?\n/);
            const out: string[] = ['#EXTM3U'];
            for (let j = 0; j < lines2.length; j++) {
                const line = lines2[j];
                if (line.startsWith('#') || !line.trim()) {
                    out.push(line);
                    continue;
                }
                const absUrl = resolveUrl(freshUrl, line.trim());
                const segToken = makeProxyToken(absUrl, streamHeaders);
                out.push(`${addonBase}/proxy/hls/segment.ts?token=${segToken}`);
            }
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            return res.send(out.join('\n'));
        }

        // Non-HLS (direct URL) — just redirect
        res.redirect(302, freshUrl);
    } catch (err: any) {
        console.error('[CC Proxy] Error:', err?.message || err);
        res.status(500).send('#EXTM3U\n# Proxy error');
    }
});
*/

// ── HLS Manifest Proxy ──
app.get('/proxy/hls/manifest.m3u8', async (req: any, res: any) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).send('#EXTM3U\n# Missing token');

        const decoded = decodeProxyToken(token);
        if (!decoded) return res.status(400).send('#EXTM3U\n# Invalid token');

        const upstream = decoded.u;
        const headers = decoded.h || {};
        const expire = decoded.e || 0;

        if (!upstream) return res.status(400).send('#EXTM3U\n# Missing upstream URL');
        if (expire && Date.now() > expire) return res.status(410).send('#EXTM3U\n# Token expired');

        console.log(`[HLS Proxy] Fetching: ${upstream.substring(0, 100)}...`);

        const { body, statusCode } = await request(upstream, { headers });
        if (statusCode !== 200) {
            return res.status(502).send(`#EXTM3U\n# Upstream error ${statusCode}`);
        }

        const text = await body.text();
        const addonBase = getAddonBase(req);

        // If it's a master playlist, filter for the best video quality
        if (text.includes('#EXT-X-STREAM-INF:')) {
            const lines = text.split(/\r?\n/);

            interface Variant {
                info: string;
                url: string;
                height: number;
                bandwidth: number;
            }
            const variants: Variant[] = [];
            const mediaLines: string[] = [];
            const otherTags: string[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('#EXT-X-MEDIA:')) {
                    mediaLines.push(line);
                } else if (line.startsWith('#EXT-X-STREAM-INF:')) {
                    const nextLine = lines[i + 1];
                    if (nextLine && !nextLine.startsWith('#')) {
                        // Extract height and bandwidth
                        let height = 0;
                        let bandwidth = 0;
                        const hMatch = line.match(/RESOLUTION=\d+x(\d+)/i);
                        if (hMatch) height = parseInt(hMatch[1], 10);
                        const bMatch = line.match(/BANDWIDTH=(\d+)/i);
                        if (bMatch) bandwidth = parseInt(bMatch[1], 10);

                        variants.push({
                            info: line,
                            url: resolveUrl(upstream, nextLine.trim()),
                            height,
                            bandwidth
                        });
                        i++; // skip original URL line
                    }
                } else if (line.startsWith('#') && !line.startsWith('#EXTINF')) {
                    if (line === '#EXTM3U') continue;
                    otherTags.push(line);
                }
            }

            if (variants.length > 0) {
                // Sort by resolution then bandwidth
                variants.sort((a, b) => (b.height - a.height) || (b.bandwidth - a.bandwidth));
                const best = variants[0];

                const result = ['#EXTM3U'];
                for (const tag of otherTags) result.push(tag);

                // Rewrite media lines (audio/subs)
                for (const ml of mediaLines) {
                    const rewritten = ml.replace(/URI="([^"]+)"/, (_match: string, uri: string) => {
                        const absUri = resolveUrl(upstream, uri);
                        const segToken = makeProxyToken(absUri, headers);
                        return `URI="${addonBase}/proxy/hls/manifest.m3u8?token=${segToken}"`;
                    });
                    result.push(rewritten);
                }

                // Add the best variant
                const bestToken = makeProxyToken(best.url, headers);
                result.push(best.info);
                result.push(`${addonBase}/proxy/hls/manifest.m3u8?token=${bestToken}`);

                res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
                return res.send(result.join('\n'));
            }
        }

        // Regular (media) playlist — rewrite segment URLs and sub-playlists
        const lines = text.split(/\r?\n/);
        const output: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Rewrite #EXT-X-KEY URI
            if (line.startsWith('#EXT-X-KEY:') && line.includes('URI=')) {
                const rewritten = line.replace(/URI="([^"]+)"/, (_match: string, uri: string) => {
                    const absUri = resolveUrl(upstream, uri);
                    const keyToken = makeProxyToken(absUri, headers);
                    return `URI="${addonBase}/proxy/hls/segment.ts?token=${keyToken}"`;
                });
                output.push(rewritten);
                continue;
            }

            // Rewrite #EXT-X-MAP URI
            if (line.startsWith('#EXT-X-MAP:') && line.includes('URI=')) {
                const rewritten = line.replace(/URI="([^"]+)"/, (_match: string, uri: string) => {
                    const absUri = resolveUrl(upstream, uri);
                    const mapToken = makeProxyToken(absUri, headers);
                    return `URI="${addonBase}/proxy/hls/segment.ts?token=${mapToken}"`;
                });
                output.push(rewritten);
                continue;
            }

            // Non-comment, non-empty line = segment or sub-playlist URL
            if (!line.startsWith('#') && line.trim()) {
                const absUrl = resolveUrl(upstream, line.trim());

                // Sub-playlist (.m3u8) — proxy recursively
                if (absUrl.includes('.m3u8') || absUrl.includes('m3u8')) {
                    const subToken = makeProxyToken(absUrl, headers);
                    output.push(`${addonBase}/proxy/hls/manifest.m3u8?token=${subToken}`);
                } else {
                    // Media segment (.ts, .aac, .mp4, fmp4, etc.)
                    const segToken = makeProxyToken(absUrl, headers);
                    output.push(`${addonBase}/proxy/hls/segment.ts?token=${segToken}`);
                }
                continue;
            }

            output.push(line);
        }

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.send(output.join('\n'));
    } catch (err: any) {
        console.error('[HLS Proxy] Error:', err?.message || err);
        res.status(500).send('#EXTM3U\n# Proxy error');
    }
});

// ── HLS Segment Proxy ──
app.get('/proxy/hls/segment.ts', async (req: any, res: any) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).end();

        const decoded = decodeProxyToken(token);
        if (!decoded) return res.status(400).end();

        const upstream = decoded.u;
        const headers = decoded.h || {};
        const expire = decoded.e || 0;

        if (!upstream) return res.status(400).end();
        if (expire && Date.now() > expire) return res.status(410).end();

        const { body, statusCode, headers: respHeaders } = await request(upstream, { headers });

        if (statusCode !== 200) {
            return res.status(statusCode).end();
        }

        const ct = respHeaders['content-type'] as string || 'video/MP2T';
        res.setHeader('Content-Type', ct);

        await pipeline(body, res);
    } catch (err: any) {
        if (!res.headersSent) res.status(500).end();
    }
});

// ── HLS Subtitle Playlist Proxy ──
app.get('/proxy/hls/subtitle.m3u8', async (req: any, res: any) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).send('#EXTM3U\n# Missing token');

        const decoded = decodeProxyToken(token);
        if (!decoded) return res.status(400).send('#EXTM3U\n# Invalid token');

        const upstream = decoded.u;
        const headers = decoded.h || {};
        if (!upstream) return res.status(400).send('#EXTM3U\n# Missing URL');

        const { body, statusCode } = await request(upstream, { headers });
        if (statusCode !== 200) return res.status(502).send('#EXTM3U\n# Upstream error');

        const text = await body.text();
        const addonBase = getAddonBase(req);
        const lines = text.split(/\r?\n/);
        const out: string[] = [];

        for (const line of lines) {
            if (!line.startsWith('#') && line.trim()) {
                const absUrl = resolveUrl(upstream, line.trim());
                const segToken = makeProxyToken(absUrl, headers);
                out.push(`${addonBase}/proxy/hls/subtitle.vtt?token=${segToken}`);
            } else {
                out.push(line);
            }
        }

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.send(out.join('\n'));
    } catch (err: any) {
        res.status(500).send('#EXTM3U\n# Proxy error');
    }
});

// ── HLS Subtitle VTT Proxy ──
app.get('/proxy/hls/subtitle.vtt', async (req: any, res: any) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).end();

        const decoded = decodeProxyToken(token);
        if (!decoded) return res.status(400).end();

        const upstream = decoded.u;
        const headers = decoded.h || {};
        if (!upstream) return res.status(400).end();

        const { body, statusCode } = await request(upstream, { headers });
        if (statusCode !== 200) return res.status(502).end();

        res.setHeader('Content-Type', 'text/vtt');
        await pipeline(body, res);
    } catch (err: any) {
        if (!res.headersSent) res.status(500).end();
    }
});

const PORT = process.env.PORT || 11470;
app.listen(PORT, () => {
    console.log(`SelfStream addon running on port ${PORT}`);
});
