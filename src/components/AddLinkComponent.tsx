import { Button, Spinner } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { useEffect, useState, useRef } from "react";
import { useOnClickOutside } from 'usehooks-ts';

interface AddLinkComponentProps {
    onAdd: (arg0: string) => void
    onModified?: () => void
    variant?: string
    loading: boolean
}

function AddLinkComponent({ onAdd, loading, onModified = () => { }, variant = "primary" }: AddLinkComponentProps) {
    const ref = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [inputClicked, setInputClicked] = useState(false);
    const [urlInput, setUrlInput] = useState("");

    useOnClickOutside(ref, () => {
        setInputClicked(false);
        onModified();
    });

    if (!hovered && !inputClicked) {
        return (
            <Button variant={variant}
                onClick={() => setInputClicked(true)}
                onMouseEnter={() => setHovered(true)}>
                + Add New Link
            </Button>

        );
    } else {
        return (
            <InputGroup
                ref={ref}
                onMouseLeave={() => setHovered(false)}>
                <Button variant={variant}
                    onClick={() => {
                    setHovered(false)
                    setInputClicked(false)
                    }}
                >
                    Add New Link

                </Button>
                <FormControl aria-label="Enter Url..."
                    disabled={loading}
                    value={urlInput}
                    onClick={() => setInputClicked(true)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            onAdd(urlInput);
                            onModified();
                        }
                    }}
                    onChange={(event) => {
                        setUrlInput(event.target.value);
                        onModified();
                    }
                    } />
                <Button
                    variant={variant}
                    onClick={() => {
                        onAdd(urlInput);
                        onModified();
                    }}>
                    {loading && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />

                    ) ||
                        "+"
                    }
                </Button>
            </InputGroup>
        )
    }

}

export default AddLinkComponent;
