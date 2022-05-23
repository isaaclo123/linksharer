import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Bookmark } from "../models/Bookmark";
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { API } from 'aws-amplify';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const initialState: Bookmark = {
    title: "",
    id: "",
    url: "",
    image: "",
    imageThumb: "",
    createdDate: "",
    userId: ""
};

function BookmarkViewPage() {
    const [state, setState] = useState(initialState);
    const [error, setError] = useState(null);
    const bookmark = useLocation().state as Bookmark;
    const navigate = useNavigate();
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
    }, [bookmark, id]);

    if (error) {
        return (<Alert variant="danger">{error}</Alert>)
    }

    return (
        <Card className="text-center">
            <Card.Header>{state.title}</Card.Header>
            <Card.Img src={state.image} />
            <hr style={{ padding: 0, margin: 0 }} />
            <Card.Body>
                <Card.Text>
                    URL: <Card.Link href={state.url}>{state.url}</Card.Link>
                    <br />
                    Created Date: {state.createdDate}
                </Card.Text>
            </Card.Body>
            <Card.Footer>

                <ButtonGroup>
                    <Button
                        variant="success"
                        onClick={() => {
                            navigator.clipboard.writeText(state.url);
                            alert("Copied URL!")
                        }}>
                        Copy URL
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            window.open(state.image, '_blank')
                        }}>
                        Download Image
                    </Button>
                    <Button
                        variant="danger"

                        onClick={() => {
                            (async () => {
                                try {
                                    await API
                                        .del("linksharerBookmarksApi", `/bookmarks/${bookmark.id}`, {
                                            response: true
                                        });
                                    navigate('/')
                                } catch (error: any) {
                                    console.log(error.response?.data.error)
                                    setError(error.response?.data.error)
                                }
                            }
                            )()
                        }}>
                        Delete
                    </Button>
                </ButtonGroup>
            </Card.Footer>
        </Card>
    );
}

export default BookmarkViewPage;
