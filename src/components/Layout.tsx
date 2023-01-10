import * as React from 'react';
import { Container } from 'reactstrap';

import NavMenu from './NavMenu';
import SideBar from './SideBar';

export default class Layout extends React.PureComponent<{}, { children?: React.ReactNode }> {
    public render() {
        return (
            <React.Fragment>
                <SideBar />
                <NavMenu />
                <Container className="main-container">
                    {this.props.children}
                </Container>
            </React.Fragment>
        );
    }
}