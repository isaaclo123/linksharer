export interface Bookmark {
    title: string,
    url: string
    image: string,
    imageThumb: string,
    id: string,
    userId: string,
    createdDate: string
};

export interface BookmarksResponse {
    bookmarks: Bookmark[]
};
