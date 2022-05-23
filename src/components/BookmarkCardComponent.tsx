import { Button, ButtonGroup, Card, Spinner } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { useEffect, useState, useRef } from "react";
import { useOnClickOutside } from 'usehooks-ts';
import { Bookmark } from "../models/Bookmark";

interface BookmarkCardComponentProps {
    bookmark: Bookmark
    onDelete: () => void
    onClick: () => void
}

function BookmarkCardComponent({ bookmark, onClick, onDelete }: BookmarkCardComponentProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <Card
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>
            {hovered && (
                <ButtonGroup
                    style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}
                    size="sm">
                    <Button
                        variant="danger"
                        onClick={onDelete}>
                        <i className="fa fa-trash" aria-hidden="true" />
                    </Button>
                </ButtonGroup>
            )}
            <Card.Img className="hover-zoom" variant="top" src={bookmark.imageThumb} onClick={onClick} />
            <Card.Body>
                <Card.Text>
                    <Card.Title onClick={onClick} className="hover-title">
                        {bookmark.title}
                    </Card.Title>
                    <Card.Link className="text-truncate" href={bookmark.url}>
                        <div className="text-truncate">{bookmark.url}</div>
                    </Card.Link>
                </Card.Text>
            </Card.Body>
        </Card>
    )

    // <Button variant="success"
    //     onClick={() => { window.location = bookmark.url as any }}>
    //     View
    // </Button>
}

export default BookmarkCardComponent;
