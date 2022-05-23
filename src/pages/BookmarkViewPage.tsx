import Card from 'react-bootstrap/Card';
import { Bookmark } from "../models/Bookmark";
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Amplify, { API } from 'aws-amplify';
import { Alert } from 'react-bootstrap';

const initialState: Bookmark = {
    title: "",
    id: "",
    url: "",
    image: "",
    imageThumb: "",
    createdDate: "",
    userId: ""
};

interface LocationState {
    bookmark: Bookmark
}

const initialError : string | null = null;

function BookmarkViewPage() {
    const [state, setState] = useState(initialState);
    const [error, setError] = useState(null);
    const bookmark = useLocation().state as Bookmark;
    let { id } = useParams();

    useEffect(() => {
        if (bookmark) {
            setState(bookmark);
            return;
        }

        if (id) {
            (async () => {
                try {
                    const req = await API
                        .get("linksharerBookmarksApi", `/bookmarks/${id}`, {
                            response: true
                        });
                    console.log(req)
                    setState(req.data);
                } catch (error: any) {
                    console.log(error.response?.data.error)
                    setError(error.response?.data.error)
                }
            })();
        }
    }, []);

    if (error) {
        return (<Alert variant="danger">{error}</Alert>)
    }

    return (
        <Card className="text-center">
            <Card.Header>{state.title}</Card.Header>
            <Card.Img src={state.image} />
            <Card.Footer>
                <Card.Link href={state.url}>{state.url}</Card.Link>
            </Card.Footer>
        </Card>
    );
}

export default BookmarkViewPage;
