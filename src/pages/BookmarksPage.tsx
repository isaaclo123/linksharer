import { Alert, Col, Row } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Bookmark, BookmarksResponse } from "../models/Bookmark";
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AddLinkComponent from '../components/AddLinkComponent';


import Amplify, { API } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { ErrorResponse } from '../models/Error';
import BookmarkCardComponent from '../components/BookmarkCardComponent';
import SearchComponent from '../components/SearchComponent';
import Masonry from 'react-masonry-css';

var _ = require('lodash');

const initialState: BookmarksResponse = {
    bookmarks: []
};

const initialError: string | null = null;

function BookmarksPage() {
    const [state, setState] = useState(initialState);
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
                    state.bookmarks?.map((bookmark: Bookmark) => {
                        return (
                            <div key={bookmark.id}>
                                <BookmarkCardComponent
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
                                                    bookmarks: _.filter(state.bookmarks, (b: Bookmark) => b.id != bookmark.id)
                                                })
                                            } catch (error: any) {
                                                console.log(error.response?.data.error)
                                                setError((error?.response?.data?.error as string) || "Unknown Error Occoured while deleting card!");
                                            }
                                        }
                                        )()
                                    }}
                                />
                            </div>)
                    })
                }
            </Masonry>

            <div className="linkadd-area" style={{position: "fixed"}}>
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
                                    setState({
                                        bookmarks: [req.data].concat(state.bookmarks)
                                    });
                                    setLinkLoading(false);
                            } catch (error: any) {
                                setLinkLoading(false);
                                console.log(error)
                                setLinkError((error?.response?.data?.error as string) || "Unknown Error Occoured!");
                            }
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
