import * as React from "react";
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavItem,
  NavLink,
  Button,
} from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./NavMenu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faSearch } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { push } from "connected-react-router";

import UserHeaderWidget from "./User/UserHeaderWidget";
import { ApplicationState } from "../store";
import * as NotificationStore from "../store/Notifications";
import * as BugsStore from "../store/Bugs";
import { store } from "../";

import { toastr } from "react-redux-toastr";

type NavMenuProps = NotificationStore.NotificationsState &
  BugsStore.BugsState &
  typeof BugsStore.actionCreators &
  typeof NotificationStore.actionCreators;

class NavMenu extends React.PureComponent<
  NavMenuProps,
  { isOpen: boolean; selectedBug: any }
> {
  public state = {
    isOpen: false,
    selectedBug: undefined,
  };

  public componentDidMount() {
    if (!this.props.bugs || this.props.bugs === []) {
      if (!this.props.isLoading) {
        console.log("Header requesting bugs");
        this.props.requestBugs(250);
      }
    }
  }

  public componentDidUpdate(prevProps: NavMenuProps) {
    if (
      this.props.notifications !== [] &&
      this.props.notifications !== prevProps.notifications
    ) {
      // looks like we have a new notification
      const n = this.props.notifications.pop();
      if (n !== undefined) {
        switch (n.severity) {
          case 0:
            toastr.info(n.title, n.message);
            break;
          case 1:
            toastr.success(n.title, n.message);
            break;
          default:
            toastr.info(n.title, n.message);
        }
      }
    }
  }

  private handleChange(so: any) {
    console.log(`Option selected:`, so);
    if (so !== undefined && so.value.bugId) {
      this.setState({
        selectedBug: { value: undefined, label: "Quick Jump To Bug" },
      });
      store.dispatch(push(`/bugs/${so.value.bugId}`));
    }
  }

  public render() {
    const selectStyle = {
      option: (styles: any, state: any) => ({
        ...styles,
        color: state.isSelected ? "#FFF" : styles.color,
        backgroundColor: state.isSelected ? "#1b6d85" : styles.color,
        borderBottom: "1px solid rgba(0, 0, 0, 0.125)",
        "&:hover": {
          color: "#FFF",
          backgroundColor: "#1b6d85",
        },
      }),
      control: (styles: any, state: any) => ({
        ...styles,
        boxShadow: state.isFocused ? "0" : 0,
        borderColor: state.isFocused ? "#1b6d85" : "#CED4DA",
        "&:hover": {
          borderColor: state.isFocused ? "#1b6d85" : "#CED4DA",
        },
      }),
    };

    let bugOptions;
    if (this.props.bugs) {
      bugOptions = this.props.bugs.map((x) => {
          return { value: x, label: `${x.bugTitle} (${x.bugSpellName})` };
      });
    }

    return (
      <header>
        <Navbar
          className="navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3"
          light
        >
          <Container fluid={true} className="header-container">
            <Button
              onClick={this.toggleSideBarCollapse}
              color="info"
              className="btn-sidebar-toggle d-none d-sm-block"
              style={{ backgroundColor: "#1b6d85" }}
            >
              <FontAwesomeIcon icon={faGripLines} />
            </Button>
            <div className="d-block d-sm-none">
              <UserHeaderWidget />
            </div>
            <NavbarToggler
              onClick={this.toggle.bind(this)}
              className="mr-2 d-xs-none"
            />
            <div
              className="quicksearch-bug d-none d-sm-block"
              style={{ width: "50%" }}
            >
              <FontAwesomeIcon icon={faSearch} className="quicksearch-icon" />
              <Select
                id="bugQuickSearch"
                placeholder="Quick Jump to Bug"
                styles={selectStyle}
                value={this.state.selectedBug}
                onChange={this.handleChange.bind(this)}
                options={bugOptions}
              />
            </div>
            <Collapse
              className="d-sm-inline-flex flex-sm-row-reverse"
              isOpen={this.state.isOpen}
              navbar
            >
              <ul className="navbar-nav flex-grow">
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/terms">
                    Terms
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/about">
                    About
                  </NavLink>
                </NavItem>
                <NavItem>
                  <a target="_blank" rel="noopener noreferrer" style={{ paddingLeft: '1rem' }} href="https://github.com/corynz/bugwalker-web" className="text-dark"><svg className="svg-inline--fa fa-github fa-w-16 fa-2x" style={{ width: '0.8em', paddingTop: '0.3rem' }} aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path></svg></a>
                </NavItem>
              </ul>
              <UserHeaderWidget />
            </Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }

  private toggleSideBarCollapse = () => {
    document.body.classList.toggle("sidebar-collapsed");
    document.body.classList.toggle("sidebar-fixed");
  };

  private toggle = () => {
    console.log("toggle collapse", this.state.isOpen);
    document.body.classList.toggle("sidebar-mobile-show");
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };
}

export default connect((state: ApplicationState) => {
  return { ...state.notifications, ...state.bugs };
}, NotificationStore.actionCreators)(NavMenu as any);
