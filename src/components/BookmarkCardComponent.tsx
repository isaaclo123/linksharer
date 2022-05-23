import { Button, ButtonGroup, Card } from "react-bootstrap";
import { useState } from "react";
import { Bookmark } from "../models/Bookmark";

interface BookmarkCardComponentProps {
    bookmark: Bookmark
    border?: string
    onDelete: () => void
    onClick: () => void
}

function BookmarkCardComponent({ border, bookmark, onClick, onDelete }: BookmarkCardComponentProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <Card
            border={border}
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
            <hr className="m-0 p-0"/>
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
