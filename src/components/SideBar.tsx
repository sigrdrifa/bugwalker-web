import * as React from 'react';
import { NavLink, NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBug, faCubes, faPlusCircle, faUsers, faQuestionCircle, faChartPie } from '@fortawesome/free-solid-svg-icons'

import { store } from '../';
import { ApplicationState } from '../store';

type SidebarProps = RouteComponentProps<{}>;

class SideBar extends React.PureComponent<SidebarProps, { isOpen: boolean, width: number }> {
  public state = {
    isOpen: false,
    width: window.innerWidth
  };

  private updateDimensions() {
    this.setState({ width: window.innerWidth });
  }

  public componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  public render() {
    const sidebarBackground = {
      backgroundImage: "url(/assets/img/sidebar.jpg)"
    };

    let wl = "";

    if (this.props.location)
      wl = this.props.location.pathname;

    const bugLinkActive = (wl.includes("/bug") || wl.includes("/submit-bug")) ? "active" : "";
    const usersLinkActive = wl.includes("/user") ? "active" : "";
    const homeLinkActive = wl === "/" ? "active" : "";
    const assetsLinkActive = wl.includes("/assets") ? "active" : "";
    const helpLinkActive = wl.includes("/help") ? "active" : "";
    return (
      <div
        id="sidebar"
        className="sidebar"
        data-color="black"
        data-image="/assets/img/sidebar.jpg"
      >
        <div className="sidebar-background" style={sidebarBackground} />
        <div className="logo">
          <a
            href="/"
            className="simple-text logo-mini"
          >
            <div className="logo-img">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96.93 97.07"><path d="M.54 89.51c.76-.86 1.62-1.77 2.59-2.69s2-1.78 2.89-2.51a16.1 16.1 0 0 1 5.48 7.51c-3 7-5.82 7-11.27.19a2.36 2.36 0 0 1-.19-1.47 2.32 2.32 0 0 1 .5-1.03z" fill="#966329" /><path d="M42.23.01c3.63 4.45 4.88 9.63 4.46 15.49-1.25 1-2.45.28-3.81-1a16.82 16.82 0 0 0-2.46-8.94l.81-5.58h1z" fill="#70c057" /><path d="M54.21 89.06c-10.88-1.33-15.93-14.2-13.06-21.75C46.59 53 65.59 46.06 78.47 54.16c9.7 6.11 10.66 21 1.72 26.86.15-8.05-3-12-10.28-11.81A22.56 22.56 0 0 0 59 72.06c-6.4 3.76-10.89 9.81-4.79 17z" fill="#e7e7e8" /><path d="M54.21 89.06c-6.1-7.14-1.61-13.2 4.79-16.92a22.56 22.56 0 0 1 10.87-2.97c7.23-.16 10.43 3.76 10.28 11.81-6.85 8.4-15.54 10.98-25.94 8.08zM69.77 41.95a46.49 46.49 0 0 0-23.79 5.11c-6.5-8 1.58-12.36 4-17.59-.19-2.16-2.52-2.64-2.5-4.5 4-4.13 7.5-4.82 12.4-2.33l-1.39 4.63c5.14 3.66 13.38 4.79 11.28 14.68z" fill="#bcbdc0" /><path d="M68.65 13.15a15 15 0 0 1 9.17 3.68c.93 2.18-2.22 3-1.32 5.23 1.78 1.27 3.06-1.38 5.06-.89 1.48.76 2 2.2 1.77 4.3-3.64 1.94-7.62 3.65-10.77 7l-7.36-6.64zM29.58 74.33a36.73 36.73 0 0 1-6.61-6.95c1.6-3 4.58-4.74 6.63-7.26s3.78-5 6.16-8.22l5 7.52c-3.09 5.39-3.89 12.18-11.18 14.91z" fill="#966329" /><path d="M43.28 33.3c-2.61-.27-2.61-2.19-3.2-3.65a41.78 41.78 0 0 0-5.21-10.14c-3.87-5.07-8.39-5-12.24 0-.87 1.14-1.18 2.76-2.55 3.34-1.39-.3-1.92-1.05-1.75-2.2.64-4.23 7.4-9.05 11.67-8.35 6.49 1.05 14.75 13.9 13.28 21zM75.19 47.81c-11.86-1.64-22.59 1.11-33.13 9.24 3.72-9.74 26.38-15.38 33.13-9.24zM13.12 69.72c7.45-3.15 16.82 6.35 16.58 15.88-4.17-2.11-4-6.69-6.42-9.36-2.59-2.86-5.99-4.36-10.16-6.52zM9.01 74.49c3.54-2.92 5.95-.29 8.06 1.19 4.84 3.4 7.63 8.13 7.61 14.25-3.74-1.82-3.91-6-6.21-8.82-2.5-3.05-6.33-3.96-9.46-6.62z" fill="#b62025" /><path d="M62.77 17.24c-5.54-1.06-6.7-4.1-6.46-7.8.28-4.27 3.29-5.77 10.64-5.26-4.98 2.98-7.98 6.48-4.18 13.06z" fill="#70c057" /><path d="M4.87 79.11c8.05-.29 15.14 8 13 15.63-2.9-7.1-6.72-12.43-13-15.63z" fill="#b62025" /><path d="M78.87 42.97c6.24 2.58 12-1.87 18.09.47-.87 2.29-3 2.85-5 3.23-3.67.71-7.36-1.11-11.19 0-1.41.45-2.42-1.25-1.9-3.7zM77.38 36.26c6.54-.39 8.38-8.71 15.11-5.56-3.22 5.61-8.62 8.08-15.11 5.56zM29.34 38.06a3.79 3.79 0 0 1-4.13 3.76 3.84 3.84 0 0 1-3.94-4.26 3.77 3.77 0 0 1 4.16-4c2.44.04 3.94 1.5 3.91 4.5zM24.05 28.38c-.65 2.92-2.33 4.34-5.34 3.72-2.13-.44-2.93-2.09-2.9-4a3.76 3.76 0 0 1 3.25-3.83c3.13-.58 4.45 1.39 4.99 4.11z" fill="#70c057" /><path d="M29.98 41.66c3.37 2 6.31 3.86 7.84 8-5.12-.69-8.23-3.87-7.84-8z" fill="#b62025" /></svg>
            </div>
          </a>
          <a
            href="/"
            className="simple-text logo-normal"
          >
            Bugwalker v1
          </a>
        </div>
        <div className="sidebar-wrapper">
          <ul className="nav">
          <NavItem className={homeLinkActive} style={{ width: '100%' }}>
              <NavLink tag={Link} to="/"
                className="nav-link">
                <FontAwesomeIcon className="svg-icon" icon={faChartPie} />
                <p>Dashboard</p>
              </NavLink>
            </NavItem>
            <NavItem className={bugLinkActive} style={{ width: '100%' }}>
              <NavLink tag={Link} to="/bugs"
                className="nav-link">
                <FontAwesomeIcon className="svg-icon" icon={faBug} />
                <p>Bugs</p>
              </NavLink>
            </NavItem>
            <NavItem className={assetsLinkActive} style={{ width: '100%' }}>
              <NavLink tag={Link} to="/assets"
                className="nav-link">
                <FontAwesomeIcon className="svg-icon" icon={faCubes} />
                <p>Game Assets</p>
              </NavLink>
            </NavItem>
            <NavItem className={usersLinkActive} style={{ width: '100%' }}>
              <NavLink tag={Link} to="/users"
                className="nav-link">
                <FontAwesomeIcon className="svg-icon" icon={faUsers} />
                <p>Users</p>
              </NavLink>
            </NavItem>
            <NavItem className={helpLinkActive} style={{ width: '100%' }}>
              <NavLink tag={Link} to="/help"
                className="nav-link">
                <FontAwesomeIcon className="svg-icon" icon={faQuestionCircle} />
                <p>Help</p>
              </NavLink>
            </NavItem>
            <NavItem className="active active-pro">
              <NavLink tag={Link} to="/submit-bug">
                <FontAwesomeIcon className="svg-icon" icon={faPlusCircle} />
                <p>Submit a new Bug</p>
              </NavLink>
            </NavItem>
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  (state: ApplicationState) => { return { ...store.getState().router }; },
)(SideBar as any);