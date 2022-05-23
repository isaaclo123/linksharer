import { Button, Card, ListGroup, Spinner } from "react-bootstrap";
import Overlay from 'react-bootstrap/Overlay';
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import { useState, useRef } from "react";
import { useOnClickOutside } from 'usehooks-ts';
import { API } from "aws-amplify";
import { SearchResponse, SearchResult } from "../models/SearchResult";
import { useNavigate } from 'react-router-dom';

const initialState: SearchResponse = {
    results: []
}

function SearchComponent() {
    const [inputClicked, setInputClicked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [state, setState] = useState(initialState);

    const navigate = useNavigate();

    const [show, setShow] = useState(false);
    const target = useRef(null);

    const ref = useRef(null);
    useOnClickOutside(ref, () => {
        setInputClicked(false);
        setShow(false);
    });

    const handleSearch = async () => {
        setLoading(true);
        try {
            if (!input) {
                setError("Did not type anything to Search!")
            } else {
                const req = await API
                    .get("linksharerBookmarksApi", "/search?" + new URLSearchParams({
                        search: input
                    }), {
                        response: true
                    });
                console.log(req.data);

                setLoading(false);
                if (!req.data.results.length) {
                    setError("No search matched query")
                }
                setState(req.data);

            }
        } catch (error: any) {
            console.log(error.response?.data.error)
            setError((error?.response?.data?.error as string) || "Unknown Error Occoured!");
        } finally {
            setLoading(false)
        }

    }

    return (
        <Form className="d-flex">
            <FormControl
                ref={ref}
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                onMouseOver={() => setShow(true)}
                onMouseOut={() => !inputClicked && setShow(false)}
                onClick={() => {
                    setInputClicked(true)
                    setShow(true)
                }}
                onKeyPress={(e) => {
                    if (e.which === 13) {
                        e.preventDefault();
                    }

                    if (e.key === 'Enter') {
                        (async () => {
                            await handleSearch()
                        })()
                    }
                }}
                onChange={(event) => {
                    setInput(event.target.value);
                    setError("");
                    setState(initialState);
                }}
            />
            <Button
                ref={target}
                onClick={() => {
                    setInputClicked(true)
                    setShow(true);
                    setLoading(false);

                    (async () => {
                        await handleSearch()
                    })()

                }}>
                {loading ? (
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />) :
                    (<i className="fas fa-search"></i>)}
            </Button>
            <Overlay target={target.current} show={show} placement="bottom-end">
                <Card className="search-container"
                    onMouseOver={() => setShow(true)}
                    onMouseOut={() => setShow(false)}>
                    <ListGroup variant="flush">
                        {error && (
                            <ListGroup.Item variant="danger">
                                <div className="fw-bold text-truncate">Error</div>
                                <div>{error}</div>
                            </ListGroup.Item>
                        )}
                        {state.results?.map(({ title, id, url }: SearchResult) => (
                            <ListGroup.Item
                                action={true}
                                onClick={() => {
                                    navigate(`/bookmarks/${id}`)
                                    setInput("");
                                    setShow(false);
                                }}>
                                <div className="fw-bold text-truncate">{title}</div>
                                <div className="text-truncate">{url}</div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card>
            </Overlay>
        </Form >
    )

}

export default SearchComponent;
