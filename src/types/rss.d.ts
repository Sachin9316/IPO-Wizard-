declare module 'react-native-rss-parser' {
    export interface RSSFeed {
        title: string;
        description: string;
        items: RSSItem[];
    }
    export interface RSSItem {
        id: string;
        title: string;
        description: string;
        links: { url: string }[];
        published: string;
        enclosures: { url: string }[];
    }
    export function parse(xml: string): Promise<RSSFeed>;
}
