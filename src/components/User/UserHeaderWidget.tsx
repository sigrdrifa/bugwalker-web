import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faUserLock, faVihara } from "@fortawesome/free-solid-svg-icons";
import { Button } from "reactstrap";

import { ApplicationState } from "../../store";
import * as UserStore from "../../store/User";

type UserLoginViewProps = UserStore.UserState &
    typeof UserStore.actionCreators &
    RouteComponentProps<{}>;

class UserHeaderWidget extends React.PureComponent<UserLoginViewProps> {
    public logoutUser() {
        this.props.requestLogout();
    }

    public componentDidMount() {
        if (
            this.props.token &&
            this.props.isAuthenticated &&
            !this.props.isVerified
        ) {
            this.props.requestVerifyAuth(this.props.token, false);
        }
    }

    public render() {
        let showSubmit;
        if (this.props.isAuthenticating) {
            showSubmit = "Loading...";
        } else if (
            this.props.isAuthenticated &&
            this.props.token &&
            this.props.au &&
            this.props.username
        ) {
            showSubmit = (
                <div style={{ float: "right" }}>
                    Hi,{" "}
                    <Link to={"/user/" + this.props.au.auId}>
                        {this.props.username.toLowerCase()}
                    </Link>{" "}
                    {UserStore.isUserRoleMod(this.props.au.auRole) &&
                    <Link to="/purps/cp">
                        <FontAwesomeIcon style={{ marginLeft: '0.5rem'}} icon={faUserLock} />
                    </Link>
                    }
                    <Button
                        className="user-header-widget-logout"
                        onClick={this.logoutUser.bind(this)}
                    >
                        <FontAwesomeIcon style={{ marginLeft: '0.5rem'}} icon={faSignOutAlt} />
                    </Button>
                </div>
            );
        } else {
            showSubmit = (
                <span>
                    <Link to="/users/login">Log in</Link> |
                    <Link to="/users/register"> Register</Link>
                </span>
            );
        }
        return (
            <React.Fragment>
                <div className="user-header-widget">
                    <FontAwesomeIcon
                        className="svg-icon"
                        style={{ color: "#3cd779", margin: "0 0.4rem" }}
                        icon={faVihara}
                    />
                    {showSubmit}
                </div>
            </React.Fragment>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.user,
    UserStore.actionCreators
)(UserHeaderWidget as any);
