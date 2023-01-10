import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    FormText,
    Card,
    CardBody,
    CardTitle,
    Row,
    Col,
    Alert,
} from "reactstrap";

import { ApplicationState } from "../../store";
import * as UserStore from "../../store/User";
import { getBaseTitle } from "../../store/Constants";
import * as NotificationStore from "../../store/Notifications";

type UserLoginViewProps = UserStore.UserState &
    typeof UserStore.actionCreators &
    typeof NotificationStore.actionCreators &
    RouteComponentProps<{}>;

interface State {
    userNameInput: string;
    passInput: string;
    localValidationerror?: string;
}

class UserLoginView extends React.PureComponent<UserLoginViewProps, State> {
    state: State = {
        userNameInput: "",
        passInput: "",
    };

    constructor(props: any) {
        super(props);
        this.authErrorRender.bind(this);
    }

    public componentDidMount() {
        document.title = "Login | " + getBaseTitle();
        document.body.classList.remove("login-bg");
        document.body.classList.add("login-bg");
        this.props.fireNewNotification(
            2,
            "Cookie Policy",
            "We use cookies to keep you logged in to the site, please see our Terms and Conditions for details",
            0
        );
    }

    public componentDidUpdate(prevProps: UserLoginViewProps) {
        if (
            !prevProps.isAuthenticated &&
            this.props.isAuthenticated &&
            this.props.token
        ) {
            console.log("Successful auth! attempting verify..");
            this.props.requestVerifyAuth(this.props.token, true);
        } else if (
            prevProps.isAuthenticated &&
            !prevProps.au &&
            this.props.au
        ) {
            console.log("Successful verify!");
            console.log(this.props.au);
        }
    }

    public componentWillUnmount() {
        document.body.classList.remove("login-bg");
    }

    private handleUserNameInputChanged(event: any) {
        this.setState({ userNameInput: event.target.value });
    }

    private handleUserPassInputChanged(event: any) {
        this.setState({ passInput: event.target.value });
    }

    private validateUsername(username: string) {
        return username !== undefined && username.length > 2;
    }

    private validatePassword(password: string) {
        return password !== undefined && password.length > 7;
    }

    private authErrorRender() {
        switch (this.props.lastAuthError) {
            case 500:
                return (
                    <Alert color="danger">
                        Looks like Yu'lon didn't let you in. Please check your
                        credentials.
                    </Alert>
                );
            default:
                return undefined;
        }
    }

    private handleSubmit() {
        let username = this.state.userNameInput;
        let password = this.state.passInput;

        if (!this.validateUsername(username)) {
            this.setState({
                localValidationerror:
                    "Please check Username field, it should be at least 3 character(s).",
            });
            return;
        }
        if (!this.validatePassword(password)) {
            this.setState({
                localValidationerror:
                    "Please check Password field, it should be at least 8 character(s).",
            });
            return;
        }
        this.setState({ localValidationerror: undefined });
        this.props.requestLogin(username, password);
    }

    private onKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.handleSubmit();
        }
    }

    public render() {
        let showSubmit;
        if (this.props.isAuthenticating) {
            showSubmit = (
                <Alert color="info">
                    Reaching out to Yu'lon, please hold tight..
                </Alert>
            );
        } else if (this.props.isAuthenticated && this.props.token) {
            showSubmit = (
                <Alert color="success">Looks like Yu'lon has let you in!</Alert>
            );
        } else {
            showSubmit = (
                <Button
                    onClick={this.handleSubmit.bind(this)}
                    className="btn-bw-blue"
                >
                    Let me in
                </Button>
            );
        }
        let validationError;
        if (this.state.localValidationerror)
            validationError = (
                <Alert color="warning">{this.state.localValidationerror}</Alert>
            );

        const authError = this.authErrorRender();

        return (
            <React.Fragment>
                <Row>
                    <Col md="3" xs="0" lg="3"></Col>
                    <Col md="6" xs="12" lg="6">
                        <Card style={{ padding: "1rem 2rem" }}>
                            <CardTitle>
                                <h3>User Login</h3>
                            </CardTitle>
                            <CardBody>
                                <Form onKeyDown={this.onKeyDown.bind(this)}>
                                    <FormGroup>
                                        <Label for="usernameInput">
                                            Username
                                        </Label>
                                        <Input
                                            value={this.state.userNameInput}
                                            onChange={this.handleUserNameInputChanged.bind(
                                                this
                                            )}
                                            type="text"
                                            name="usernameText"
                                            id="usernameInput"
                                            placeholder=""
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="usernamePassword">
                                            Password
                                        </Label>
                                        <Input
                                            value={this.state.passInput}
                                            onChange={this.handleUserPassInputChanged.bind(
                                                this
                                            )}
                                            type="password"
                                            name="usernamePassword"
                                            id="usernamePassword"
                                            placeholder=""
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <FormText color="muted">
                                            We use cookies to store your login
                                            session, by logging in you accept
                                            that we place a cookie in your
                                            browser for authentication. For
                                            details please see the privacy
                                            policy in our{" "}
                                            <Link to="/terms">
                                                Terms and Conditions
                                            </Link>
                                            .
                                        </FormText>
                                    </FormGroup>
                                    {validationError}
                                    {authError}
                                    <br />
                                    {showSubmit}
                                    <br />
                                    <br />
                                    <FormGroup>
                                        <FormText muted>
                                            Don't have an account yet? You can{" "}
                                            <Link to="/user/register">
                                                create one here.
                                            </Link>
                                        </FormText>
                                    </FormGroup>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md="3" xs="0" lg="3"></Col>
                </Row>
            </React.Fragment>
        );
    }
}

export default connect(
    (state: ApplicationState) => {
        return { ...state.user, ...state.notifications };
    },
    { ...UserStore.actionCreators, ...NotificationStore.actionCreators }
)(UserLoginView as any);
