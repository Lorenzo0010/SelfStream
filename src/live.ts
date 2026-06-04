import { makeProxyToken, getAddonBase } from './proxy';

// ============================================================
// TV CHANNELS — ported from StreamViX config/tv_channels.json
// ============================================================

export interface TvChannel {
    id: string;
    type: string;
    name: string;
    poster?: string;
    logo?: string;
    background?: string;
    description?: string;
    category: string | string[];
    staticUrlF: string;
    staticUrlD?: string;
    staticUrlD_CF?: string;
    vavooNames?: string[];
    epgChannelIds?: string[];
}

export const TV_CHANNELS: TvChannel[] = [
  {
    "id": "rai1",
    "type": "tv",
    "name": "Rai 1",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/rai1.png",
    "description": "Rai 1 - Canale pubblico italiano",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/rai1/browser-HLS8/rai1.m3u8",
    "staticUrlD": "https://dlhd.dad/watch.php?id=850",
    "vavooNames": ["RAI 1"],
    "epgChannelIds": ["rai1.it"],
    "staticUrlD_CF": "https://proxy.stremio.dpdns.org/manifest.m3u8?id=850"
  },
  {
    "id": "rai2",
    "type": "tv",
    "name": "Rai 2",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/rai2.png",
    "description": "Rai 2 - Canale pubblico italiano",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/rai2/browser-HLS8/rai2.m3u8",
    "vavooNames": ["RAI 2"],
    "epgChannelIds": ["rai2.it"]
  },
  {
    "id": "rai3",
    "type": "tv",
    "name": "Rai 3",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/rai3.png",
    "description": "Rai 3 - Canale pubblico italiano",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/rai3/browser-HLS8/rai3.m3u8",
    "vavooNames": ["RAI 3"],
    "epgChannelIds": ["rai3.it"]
  },
  {
    "id": "rai4",
    "type": "tv",
    "name": "Rai 4",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/rai4.png",
    "description": "Rai 4",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/rai4/browser-HLS8/rai4.m3u8",
    "vavooNames": ["RAI 4"],
    "epgChannelIds": ["rai4.it"]
  },
  {
    "id": "canale5",
    "type": "tv",
    "name": "Canale 5",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/canale5.png",
    "description": "Canale 5 - Mediaset",
    "category": "mediaset",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/canale5/browser-HLS8/canale5.m3u8",
    "vavooNames": ["CANALE 5"],
    "epgChannelIds": ["canale.5.it"]
  },
  {
    "id": "italia1",
    "type": "tv",
    "name": "Italia 1",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/italia1.png",
    "description": "Italia 1 - Mediaset",
    "category": "mediaset",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/italia1/browser-HLS8/italia1.m3u8",
    "vavooNames": ["ITALIA 1"],
    "epgChannelIds": ["italia1.it"]
  },
  {
    "id": "rete4",
    "type": "tv",
    "name": "Rete 4",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/rete4.png",
    "description": "Rete 4 - Mediaset",
    "category": "mediaset",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/rete4/browser-HLS8/rete4.m3u8",
    "vavooNames": ["RETE 4"],
    "epgChannelIds": ["rete4.it"]
  },
  {
    "id": "la7",
    "type": "tv",
    "name": "LA7",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/la7.png",
    "description": "LA7",
    "category": "general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/la7/browser-HLS8/la7.m3u8",
    "vavooNames": ["LA7"],
    "epgChannelIds": ["la7.it"]
  },
  {
    "id": "tv8",
    "type": "tv",
    "name": "TV8",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/tv8.png",
    "description": "TV8",
    "category": "general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/tv8/browser-HLS8/tv8.m3u8",
    "vavooNames": ["TV 8"],
    "epgChannelIds": ["tv8.it"]
  },
  {
    "id": "nove",
    "type": "tv",
    "name": "NOVE",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/nove.png",
    "description": "NOVE",
    "category": "general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/nove/browser-HLS8/nove.m3u8",
    "vavooNames": ["NOVE"],
    "epgChannelIds": ["nove.it"]
  },
  {
    "id": "20mediaset",
    "type": "tv",
    "name": "20 Mediaset",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/20.png",
    "description": "20 - Mediaset",
    "category": "mediaset",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/20mediaset/browser-HLS8/20mediaset.m3u8",
    "vavooNames": ["20 MEDIASET"],
    "epgChannelIds": ["20.it"]
  },
  {
    "id": "raisport",
    "type": "tv",
    "name": "Rai Sport",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/raisport.png",
    "description": "Rai Sport",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/raisport/browser-HLS8/raisport.m3u8",
    "vavooNames": ["RAI SPORT"],
    "epgChannelIds": ["raisport.it"]
  },
  {
    "id": "raigulp",
    "type": "tv",
    "name": "Rai Gulp",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/raigulp.png",
    "description": "Rai Gulp",
    "category": "rai,kids",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/raigulp/browser-HLS8/raigulp.m3u8",
    "vavooNames": ["RAI GULP"],
    "epgChannelIds": ["raigulp.it"]
  },
  {
    "id": "raiyoyo",
    "type": "tv",
    "name": "Rai Yoyo",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/raiyoyo.png",
    "description": "Rai Yoyo",
    "category": "rai,kids",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/raiyoyo/browser-HLS8/raiyoyo.m3u8",
    "vavooNames": ["RAI YOYO"],
    "epgChannelIds": ["raiyoyo.it"]
  },
  {
    "id": "rainews",
    "type": "tv",
    "name": "Rai News 24",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/rainews.png",
    "description": "Rai News 24",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/rainews24/browser-HLS8/rainews24.m3u8",
    "vavooNames": ["RAI NEWS 24"],
    "epgChannelIds": ["rainews.it"]
  },
  {
    "id": "raiuno",
    "type": "tv",
    "name": "Rai Premium",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/raipremium.png",
    "description": "Rai Premium",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/raipremium/browser-HLS8/raipremium.m3u8",
    "epgChannelIds": ["raipremium.it"]
  },
  {
    "id": "raistoria",
    "type": "tv",
    "name": "Rai Storia",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/raistoria.png",
    "description": "Rai Storia",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/raistoria/browser-HLS8/raistoria.m3u8",
    "epgChannelIds": ["raistoria.it"]
  },
  {
    "id": "iris",
    "type": "tv",
    "name": "Iris",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/iris.png",
    "description": "Iris - Mediaset",
    "category": "mediaset",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/iris/browser-HLS8/iris.m3u8",
    "epgChannelIds": ["iris.it"]
  },
  {
    "id": "la7d",
    "type": "tv",
    "name": "LA7d",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/la7d.png",
    "description": "LA7d",
    "category": "general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/la7d/browser-HLS8/la7d.m3u8",
    "epgChannelIds": ["la7d.it"]
  },
  {
    "id": "cine34",
    "type": "tv",
    "name": "Cine34",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/cine34.png",
    "description": "Cine34 - Mediaset",
    "category": "mediaset",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/cine34/browser-HLS8/cine34.m3u8",
    "epgChannelIds": ["cine34.it"]
  },
  {
    "id": "focus",
    "type": "tv",
    "name": "Focus",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/focus.png",
    "description": "Focus - Mediaset",
    "category": "mediaset,documentari",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/focus/browser-HLS8/focus.m3u8",
    "epgChannelIds": ["focus.it"]
  },
  {
    "id": "boing",
    "type": "tv",
    "name": "Boing",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/boing.png",
    "description": "Boing - Mediaset",
    "category": "mediaset,kids",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/boing/browser-HLS8/boing.m3u8",
    "epgChannelIds": ["boing.it"]
  },
  {
    "id": "cartoonito",
    "type": "tv",
    "name": "Cartoonito",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/cartoonito.png",
    "description": "Cartoonito",
    "category": "kids",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/cartoonito/browser-HLS8/cartoonito.m3u8",
    "epgChannelIds": ["cartoonito.it"]
  },
  {
    "id": "topcrime",
    "type": "tv",
    "name": "Top Crime",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/topcrime.png",
    "description": "Top Crime",
    "category": "general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/topcrime/browser-HLS8/topcrime.m3u8",
    "epgChannelIds": ["topcrime.it"]
  },
  {
    "id": "mediasetextra",
    "type": "tv",
    "name": "Mediaset Extra",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/mediasetextra.png",
    "description": "Mediaset Extra",
    "category": "mediaset,general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/mediasetextra/browser-HLS8/mediasetextra.m3u8",
    "epgChannelIds": ["mediasetextra.it"]
  },
  {
    "id": "mediaset4",
    "type": "tv",
    "name": "Mediaset Italia Due",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/italiadue.png",
    "description": "Mediaset Italia Due",
    "category": "mediaset",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/italiadue/browser-HLS8/italiadue.m3u8",
    "epgChannelIds": ["italiadue.it"]
  },
  {
    "id": "tgcom24",
    "type": "tv",
    "name": "TgCom24",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/tgcom24.png",
    "description": "TgCom24 - Mediaset",
    "category": "mediaset,news",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/tgcom24/browser-HLS8/tgcom24.m3u8",
    "epgChannelIds": ["tgcom24.it"]
  },
  {
    "id": "sportmediaset",
    "type": "tv",
    "name": "Sport Mediaset",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/sportmediaset.png",
    "description": "Sport Mediaset",
    "category": "mediaset,sport",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/sportmediaset/browser-HLS8/sportmediaset.m3u8",
    "epgChannelIds": ["sportmediaset.it"]
  },
  {
    "id": "skytg24",
    "type": "tv",
    "name": "Sky TG24",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/skytg24.png",
    "description": "Sky TG24",
    "category": "sky,news",
    "staticUrlF": "https://skytg24-lh.akamaihd.net/i/skytg24_1@169310/index_400_av-b.m3u8",
    "epgChannelIds": ["skytg24.it"]
  },
  {
    "id": "skyuno",
    "type": "tv",
    "name": "Sky Uno",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/skyuno.png",
    "description": "Sky Uno",
    "category": "sky",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/skyuno/browser-HLS8/skyuno.m3u8",
    "vavooNames": ["SKY UNO"],
    "epgChannelIds": ["skyuno.it"]
  },
  {
    "id": "supertennis",
    "type": "tv",
    "name": "SuperTennis",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/supertennis.png",
    "description": "SuperTennis",
    "category": "sport",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/supertennis/browser-HLS8/supertennis.m3u8",
    "epgChannelIds": ["supertennis.it"]
  },
  {
    "id": "sportitalia",
    "type": "tv",
    "name": "Sportitalia",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/sportitalia.png",
    "description": "Sportitalia",
    "category": "sport",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/sportitalia/browser-HLS8/sportitalia.m3u8",
    "epgChannelIds": ["sportitalia.it"]
  },
  {
    "id": "rainotizie",
    "type": "tv",
    "name": "Rai 5",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/rai5.png",
    "description": "Rai 5",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/rai5/browser-HLS8/rai5.m3u8",
    "epgChannelIds": ["rai5.it"]
  },
  {
    "id": "raimovie",
    "type": "tv",
    "name": "Rai Movie",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/raimovie.png",
    "description": "Rai Movie",
    "category": "rai",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/raimovie/browser-HLS8/raimovie.m3u8",
    "epgChannelIds": ["raimovie.it"]
  },
  {
    "id": "discovery",
    "type": "tv",
    "name": "Discovery Channel",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/discovery.png",
    "description": "Discovery Channel",
    "category": "discovery",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/discovery/browser-HLS8/discovery.m3u8",
    "epgChannelIds": ["discovery.it"]
  },
  {
    "id": "realtime",
    "type": "tv",
    "name": "Real Time",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/realtime.png",
    "description": "Real Time",
    "category": "discovery,general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/realtime/browser-HLS8/realtime.m3u8",
    "epgChannelIds": ["realtime.it"]
  },
  {
    "id": "dmax",
    "type": "tv",
    "name": "DMAX",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/dmax.png",
    "description": "DMAX",
    "category": "general,discovery",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/dmax/browser-HLS8/dmax.m3u8",
    "epgChannelIds": ["dmax.it"]
  },
  {
    "id": "giallo",
    "type": "tv",
    "name": "Giallo",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/giallo.png",
    "description": "Giallo",
    "category": "general,discovery",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/giallo/browser-HLS8/giallo.m3u8",
    "epgChannelIds": ["giallo.it"]
  },
  {
    "id": "food",
    "type": "tv",
    "name": "Food Network",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/foodnetwork.png",
    "description": "Food Network",
    "category": "discovery,cinema",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/foodnetwork/browser-HLS8/foodnetwork.m3u8",
    "epgChannelIds": ["foodnetwork.it"]
  },
  {
    "id": "warner",
    "type": "tv",
    "name": "Warner TV",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/warnertv.png",
    "description": "Warner TV",
    "category": "general,discovery",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/warnertv/browser-HLS8/warnertv.m3u8",
    "epgChannelIds": ["warnertv.it"]
  },
  {
    "id": "motor1",
    "type": "tv",
    "name": "Motor1",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/motor1.png",
    "description": "Motor1",
    "category": "news",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/motor1/browser-HLS8/motor1.m3u8",
    "epgChannelIds": ["motor1.it"]
  },
  {
    "id": "nick",
    "type": "tv",
    "name": "Nickelodeon",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/nickelodeon.png",
    "description": "Nickelodeon",
    "category": "kids",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/nickelodeon/browser-HLS8/nickelodeon.m3u8",
    "epgChannelIds": ["nickelodeon.it"]
  },
  {
    "id": "frisbee",
    "type": "tv",
    "name": "Frisbee",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/frisbee.png",
    "description": "Frisbee",
    "category": "kids",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/frisbee/browser-HLS8/frisbee.m3u8",
    "epgChannelIds": ["frisbee.it"]
  },
  {
    "id": "deejay",
    "type": "tv",
    "name": "Deejay TV",
    "poster": "https://cdn.jsdelivr.net/gh/Tundrak/IPTV-Italia/logos/deejaytv.png",
    "description": "Deejay TV",
    "category": "general",
    "staticUrlF": "https://viamotionhsi.netplus.ch/live/eds/deejaytv/browser-HLS8/deejaytv.m3u8",
    "epgChannelIds": ["deejaytv.it"]
  }
];

// NOTE: This list contains the main Italian channels.
// The full 163-channel list from StreamViX (including all Pluto TV channels)
// is available in the StreamViX repo at config/tv_channels.json

// Mappa categoria -> genre Stremio
const CAT_TO_GENRE: Record<string, string> = {
    'rai': 'RAI',
    'mediaset': 'Mediaset',
    'sky': 'Sky',
    'sport': 'Sport',
    'news': 'News',
    'kids': 'Bambini',
    'general': 'Generali',
    'general,discovery': 'Discovery',
    'discovery,general': 'Discovery',
    'discovery': 'Discovery',
    'discovery,cinema': 'Cinema',
    'rai,kids': 'Bambini',
    'mediaset,documentari': 'Documentari',
    'mediaset,general': 'Generali',
    'mediaset,kids': 'Bambini',
    'mediaset,news': 'News',
    'mediaset,sport': 'Sport',
    'sky,news': 'News',
    'pluto': 'Pluto',
};

export function getChannelGenre(ch: TvChannel): string {
    const cat = Array.isArray(ch.category) ? ch.category.join(',') : (ch.category as string);
    return CAT_TO_GENRE[cat] || 'Generali';
}

/**
 * Returns Stremio meta objects for the TV catalog.
 * If genre is provided, filters by that genre.
 */
export function getTvMetas(genre?: string): any[] {
    return TV_CHANNELS
        .filter(ch => !genre || getChannelGenre(ch) === genre)
        .map(ch => ({
            id: 'tv:' + ch.id,
            type: 'tv',
            name: ch.name,
            poster: ch.poster || ch.logo || '',
            logo: ch.logo || ch.poster || '',
            background: ch.background || '',
            description: ch.description || '',
            genres: [getChannelGenre(ch)],
        }));
}

/**
 * Returns streams for a given channel ID (without the "tv:" prefix),
 * routing through SelfStream's built-in HLS proxy.
 */
export function getTvStreams(channelId: string, addonBase: string): any[] {
    const ch = TV_CHANNELS.find(c => c.id === channelId);
    if (!ch) return [];

    const streams: any[] = [];

    // Static HLS direct stream — proxied via SelfStream's /proxy/hls/manifest.m3u8
    if (ch.staticUrlF) {
        const token = makeProxyToken(ch.staticUrlF, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
        });
        streams.push({
            url: `${addonBase}/proxy/hls/manifest.m3u8?token=${token}`,
            name: ch.name,
            title: '📺 HLS (Proxy)',
            behaviorHints: { notWebReady: true },
        });
    }

    // DaddyLive Cloudflare proxy variant (when available)
    if (ch.staticUrlD_CF) {
        const token = makeProxyToken(ch.staticUrlD_CF, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Referer': 'https://dlhd.dad/',
        });
        streams.push({
            url: `${addonBase}/proxy/hls/manifest.m3u8?token=${token}`,
            name: ch.name,
            title: '🔴 DaddyLive (Proxy)',
            behaviorHints: { notWebReady: true },
        });
    }

    return streams;
}
