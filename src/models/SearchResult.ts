export interface SearchResult {
    id: string,
    url: string,
    title: string,
};

export interface SearchResponse {
    results: SearchResult[]
};
