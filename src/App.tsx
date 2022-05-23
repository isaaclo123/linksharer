import './App.css';
import Nav from 'react-bootstrap/Nav';
import FormControl from 'react-bootstrap/FormControl';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Button, Navbar, NavDropdown, } from 'react-bootstrap';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BookmarksPage from './pages/BookmarksPage';
import BookmarksViewPage from './pages/BookmarkViewPage';
import { LinkContainer } from 'react-router-bootstrap';
import { Amplify } from 'aws-amplify';
import { Authenticator } from "@aws-amplify/ui-react";

import '@aws-amplify/ui-react/styles.css';
import 'font-awesome/css/font-awesome.min.css';

import awsExports from './aws-exports';
import SearchComponent from './components/SearchComponent';
import { useRef } from 'react';
Amplify.configure(awsExports);

function App() {
    return (
        <Authenticator>
            {
                ({ signOut, user }) => (
                    <BrowserRouter>
                        <Navbar bg='light' expand="lg" fixed='top'>
                            <Container fluid>
                                <LinkContainer to="/">
                                    <Navbar.Brand href="#">LinkSharer</Navbar.Brand>
                                </LinkContainer>
                                <Navbar.Toggle aria-controls="navbarScroll" />
                                <Navbar.Collapse id="navbarScroll">
                                    <Nav
                                        className="me-auto my-2 my-lg-0"
                                        style={{ maxHeight: '100px' }}
                                        navbarScroll
                                    >
                                        <NavDropdown
                                            id="nav-dropdown-dark-example"
                                            title={user?.attributes?.email}
                                            menuVariant="dark"
                                        >
                                            <NavDropdown.Item onClick={signOut}>Sign Out</NavDropdown.Item>
                                        </NavDropdown>
                                    </Nav>
                                    <SearchComponent />
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>

                        <Container style={{ paddingTop: '5em', paddingBottom: '4em' }}>
                            <Routes>
                                <Route path="/" element={<BookmarksPage />} />
                                <Route path="/bookmarks/:id" element={<BookmarksViewPage />} />
                            </Routes>
                        </Container>
                    </BrowserRouter>
                )
            }
        </Authenticator >
    );
}

export default App;
