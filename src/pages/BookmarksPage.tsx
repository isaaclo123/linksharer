import { Alert } from 'react-bootstrap';
import { Bookmark, BookmarksResponse } from "../models/Bookmark";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddLinkComponent from '../components/AddLinkComponent';


import { API } from 'aws-amplify';
import BookmarkCardComponent from '../components/BookmarkCardComponent';
import Masonry from 'react-masonry-css';

var _ = require('lodash');

const initialState: BookmarksResponse = {
    bookmarks: []
};

function BookmarksPage() {
    const [state, setState] = useState(initialState);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [linkError, setLinkError] = useState("");
    const [linkLoading, setLinkLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const req = await API
                    .get("linksharerBookmarksApi", "/bookmarks", {
                        response: true
                    });
                setState(req.data || []);
            } catch (error: any) {
                console.log(error.response?.data.error)
                setError((error?.response?.data?.error as string) || "Unknown Error Occoured!");
            }
        })()
    }, []);

    return (
        <>
            {error && <Alert variant="danger">{error}</Alert>}
            <Masonry
                breakpointCols={{
                    default: 3,
                    1100: 2,
                    700: 1,
                }}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column">
                {
                    state.bookmarks?.map((bookmark: Bookmark, index) => {
                        return (
                            <div
                                key={bookmark.id}
                                onMouseOut={index === 0 ? () => {
                                    setSuccess(false)
                                } : undefined}>
                                <BookmarkCardComponent
                                    border={(success && index === 0) ? "primary" : undefined}
                                    bookmark={bookmark}
                                    onClick={() => {
                                        console.log(bookmark);
                                        navigate(`/bookmarks/${bookmark.id}`, { state: bookmark })
                                    }}
                                    onDelete={() => {
                                        (async () => {
                                            try {
                                                const req = await API
                                                    .del("linksharerBookmarksApi", `/bookmarks/${bookmark.id}`, {
                                                        response: true
                                                    });
                                                console.log(req);
                                                setState({
                                                    bookmarks: _.filter(state.bookmarks, (b: Bookmark) => b.id !== bookmark.id)
                                                })
                                            } catch (error: any) {
                                                console.log(error.response?.data.error)
                                                setError(error.response?.data.error)
                                                setSuccess(false);
                                            }
                                        }
                                        )()
                                    }}
                                />
                            </div>)
                    })
                }
            </Masonry>

            <div className="linkadd-area" style={{ position: "fixed" }}>
                {linkError && <Alert variant="danger">{linkError}</Alert>}

                <AddLinkComponent
                    loading={linkLoading}
                    variant={linkError ? "danger" : undefined}
                    onAdd={(input) => {
                        (async () => {
                            try {
                                setLinkLoading(true);
                                const req = await API
                                    .post("linksharerBookmarksApi", "/bookmarkadd", {
                                        response: true,
                                        body: {
                                            url: input
                                        },
                                    });
                                setSuccess(true);
                                setState({
                                    bookmarks: [req.data].concat(state.bookmarks)
                                });
                                setLinkLoading(false);
                            } catch (error: any) {
                                setLinkLoading(false);
                                console.log(error)
                                setSuccess(false);
                                setLinkError((error?.response?.data?.error as string) || "Unknown Error Occoured!");
                            }
                            window.scrollTo({
                                top: 0,
                                left: 0,
                                behavior: "smooth",
                            });
                        })()
                    }}
                    onModified={() => {
                        setLinkError("");
                    }}
                />
            </div>
        </>
    )
}

export default BookmarksPage;
