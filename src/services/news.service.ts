import * as rssParser from 'react-native-rss-parser';

const FEEDS = {
    IPO: [
        'https://www.moneycontrol.com/rss/iponews.xml',
        'https://www.livemint.com/rss/market/ipo',
        'https://www.business-standard.com/rss/ipo-120.rss',
        'https://www.financialexpress.com/market/ipo-news/feed/',
    ],
    MARKET_NEWS: [
        'https://www.moneycontrol.com/rss/latestnews.xml',
        'https://www.livemint.com/rss/markets',
        'https://www.business-standard.com/rss/latest-news-101.rss',
        'https://www.financialexpress.com/feed/',
    ],
    BULLISH: [
        'https://www.moneycontrol.com/rss/marketreports.xml',
        'https://www.business-standard.com/rss/markets-106.rss',
    ],
    BEARISH: [
        'https://www.moneycontrol.com/rss/marketoutlook.xml',
        'https://news.google.com/rss/search?q=indian+market+bearish+nifty+fall+mint+moneycontrol&hl=en-IN&gl=IN&ceid=IN:en'
    ]
};

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    url: string;
    date: string;
    timestamp: number; // Added for better sorting
    image: string;
    category: string;
    tag: string;
    source: string;
}

const getSourceFromUrl = (url?: string) => {
    if (!url) return 'News';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('moneycontrol')) return 'MoneyControl';
    if (lowerUrl.includes('livemint')) return 'Mint';
    if (lowerUrl.includes('financialexpress')) return 'FinExpress';
    if (lowerUrl.includes('business-standard')) return 'Biz-Standard';
    if (lowerUrl.includes('zeenews')) return 'Zee Business';
    if (lowerUrl.includes('ndtv')) return 'NDTV Profit';
    return 'Finance';
};

const extractThumbnail = (item: any) => {
    // 1. Check enclosures (Standard RSS)
    if (item.enclosures && item.enclosures.length > 0) {
        return item.enclosures[0].url;
    }

    // 2. Check description and content for <img> tags
    // Moneycontrol and Mint often put images in <img> tags inside description
    const searchString = (item.description || '') + (item.content || '');
    if (searchString) {
        // Look for src attributes in img tags
        const imgReg = /<img[^>]+src=["']([^"'>]+)["']/i;
        const match = imgReg.exec(searchString);
        if (match && match[1]) {
            let imgUrl = match[1];
            // Ensure URL is absolute
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            return imgUrl;
        }
    }

    // 3. Media tags (some use media:content or media:thumbnail)
    if (item.media && item.media.thumbnail) return item.media.thumbnail.url;
    if (item.media && item.media.content) return item.media.content.url;

    // 4. Source-specific fallbacks to at least look different
    const source = getSourceFromUrl(item.links?.[0]?.url);
    if (source === 'MoneyControl') return 'https://images.unsplash.com/photo-1611974714024-4607a500bc71?w=400&q=80';
    if (source === 'Mint') return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80';

    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80';
};

export const fetchNewsByCategory = async (category: string): Promise<NewsItem[]> => {
    const urls = FEEDS[category as keyof typeof FEEDS] || FEEDS.MARKET_NEWS;

    try {
        const feedPromises = urls.map(async (url) => {
            try {
                // Add headers to avoid 403 Forbidden errors
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                const responseData = await response.text();
                // Clean XML to avoid xmldom unclosed attribute warnings if possible
                const cleanedData = responseData.replace(/<img([^>]*)>/g, '<img$1/>').replace(/&nbsp;/g, ' ');
                return await rssParser.parse(cleanedData);
            } catch (e) {
                console.warn(`Failed to fetch feed: ${url}`, e);
                return null;
            }
        });

        const results = await Promise.all(feedPromises);

        const allItems: any[] = results
            .filter((r: any) => r !== null)
            .flatMap((feed: any) =>
                (feed.items || []).map((item: any) => ({
                    ...item,
                    source: getSourceFromUrl(item.links[0]?.url)
                }))
            );

        // Sort by date (newest first)
        allItems.sort((a, b) => {
            const dateA = a.published ? new Date(a.published).getTime() : 0;
            const dateB = b.published ? new Date(b.published).getTime() : 0;
            return dateB - dateA;
        });

        // Filter out items that are too old or have invalid dates if needed
        const now = Date.now();
        const formattedItems: NewsItem[] = allItems
            .map(item => {
                const ts = item.published ? new Date(item.published).getTime() : 0;
                return {
                    id: item.id || item.links[0]?.url || Math.random().toString(),
                    title: item.title?.trim() || 'No Title',
                    summary: item.description?.replace(/<[^>]*>?/gm, '').trim().slice(0, 150) || 'Tap to read full article...',
                    url: item.links[0]?.url || '',
                    date: item.published ? new Date(item.published).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent',
                    timestamp: ts,
                    image: extractThumbnail(item),
                    category: category === 'MARKET_NEWS' ? 'Market News' : category,
                    tag: category.toUpperCase(),
                    source: item.source
                };
            })
            .filter(item => item.timestamp > 0); // Keep only items with valid dates

        return formattedItems.slice(0, 50);
    } catch (error) {
        console.warn('Error fetching news:', error);
        return [];
    }
};
