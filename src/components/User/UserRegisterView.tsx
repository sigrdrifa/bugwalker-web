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
import './UserRegisterView.css';

type UserRegisterViewProps = UserStore.UserState &
    typeof UserStore.actionCreators &
    typeof NotificationStore.actionCreators &
    RouteComponentProps<{}>;

interface State {
    userNameInput: string;
    passInput: string;
    passInputConfirm: string;
    userEmailInput: string;
    userAvatarChosen: number;
    localValidationerror?: string;
}

class UserRegisterView extends React.PureComponent<
    UserRegisterViewProps,
    State
> {
    state: State = {
        userNameInput: "",
        passInput: "",
        passInputConfirm: "",
        userEmailInput: "",
        userAvatarChosen: 1
    };

    constructor(props: any) {
        super(props);
        this.authErrorRender.bind(this);
    }

    public componentDidMount() {
        document.title = "Register | " + getBaseTitle();
        document.body.classList.remove("login-bg");
        document.body.classList.add("login-bg");
    }

    public componentDidUpdate(prevProps: UserRegisterViewProps) {
        if (
            !prevProps.userRegistrationSuccess &&
            this.props.userRegistrationSuccess
        ) {
            console.log("Successful reg");
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

    private handleUserEmailInputChanged(event: any) {
        this.setState({ userEmailInput: event.target.value });
    }

    private handleUserPassInputConfirmChanged(event: any) {
        this.setState({ passInputConfirm: event.target.value });
    }

    private handleUserAvatarChosenChanged( event: any ) {
        const id = Number.parseInt(event.target.id.slice(-1));
        if(id !== undefined)
            this.setState({ userAvatarChosen: id});
    }

    private validateUsername(username: string) {
        return username !== undefined && username.length > 2 && /^[a-zA-Z]+$/.test(username);
    }

    private validatePassword(password: string) {
        return password !== undefined && password.length > 7;
    }

    private validateEmail(email: string) {
        return email !== undefined && email.length > 2 && email.indexOf("@") > 0;
    }

    private validatePasswordsMatch(password: string, passwordConfirm: string)
    {
        return password === passwordConfirm;
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
        let passwordC = this.state.passInputConfirm;
        let email = this.state.userEmailInput;
        let avatar = this.state.userAvatarChosen;

        if (!this.validateUsername(username)) {
            this.setState({
                localValidationerror:
                    "Please check Username field, it should be at least 3 character(s) and only contain letters.",
            });
            return;
        }

        if (!this.validateEmail(email)) {
            this.setState({
                localValidationerror:
                    "The provided email address is not valid."
            });
            return;
        }

        if (!this.validatePasswordsMatch(password, passwordC)) {
            this.setState({
                localValidationerror:
                    "The provided passwords do not match.",
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
        let ur: UserStore.UserRegistration = {
            userRegName: username,
            userRegEmail: email,
            userRegPass: password,
            userRegAvatar: avatar,
        };
        this.props.requestRegisterUser(ur);
    }

    private onKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.handleSubmit();
        }
    }

    public render() {
        let showSubmit;
        let ava = this.state.userAvatarChosen;
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
                    Register
                </Button>
            );
        }
        let validationError;
        if (this.state.localValidationerror)
            validationError = (
                <Alert color="warning">{this.state.localValidationerror}</Alert>
            );

        const authError = this.authErrorRender();
        const isReg = this.props.userRegistrationSuccess;
        return (
            <React.Fragment>
                <Row>
                    <Col md="3" xs="0" lg="3"></Col>
                    <Col md="6" xs="12" lg="6">
                        <Card style={{ padding: "1rem 2rem" }}>
                            <CardTitle>
                                <h3>User Registration</h3>
                            </CardTitle>
                            <CardBody>
                            {!isReg &&
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
                                        <Label for="userEmailInput">
                                            Email
                                        </Label>
                                        <Input
                                            value={this.state.userEmailInput}
                                            onChange={this.handleUserEmailInputChanged.bind(
                                                this
                                            )}
                                            type="email"
                                            name="userEmailInput"
                                            id="userEmailInput"
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
                                        <Label for="usernamePasswordConfirm">
                                            Confirm Password
                                        </Label>
                                        <Input
                                            value={this.state.passInputConfirm}
                                            onChange={this.handleUserPassInputConfirmChanged.bind(
                                                this
                                            )}
                                            type="password"
                                            name="usernamePasswordConfirm"
                                            id="usernamePasswordConfirm"
                                            placeholder=""
                                        />
                                    </FormGroup>
                                    <br />
                                    <h4>User Avatar</h4>
                                    <p>Pick one of the preconfigured avatars below (user uploaded avatars will be supported later).</p>
                                    <Row>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar1"
                                            className={"user-register-avatar img-circle" + (1 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar1.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar2"
                                            className={"user-register-avatar img-circle" + (2 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar2.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar3"
                                            className={"user-register-avatar img-circle" + (3 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar3.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar4"
                                            className={"user-register-avatar img-circle" + (4 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar4.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar5"
                                            className={"user-register-avatar img-circle" + (5 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar5.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar6"
                                            className={"user-register-avatar img-circle" + (6 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar6.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar7"
                                            className={"user-register-avatar img-circle" + (7 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar7.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar8"
                                            className={"user-register-avatar img-circle" + (8 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar8.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="3" xl="3" xs="6">
                                        <img
                                            onClick={this.handleUserAvatarChosenChanged.bind(this)}
                                            id="imgavatar9"
                                            className={"user-register-avatar img-circle" + (9 === ava ? " ava-active" : "")}
                                            src={`/assets/img/avatars/avatar9.jpg`}
                                            alt="Avatar" />
                                        </Col>
                                    </Row>


                                    <hr />
                                    <FormGroup>
                                        <FormText color="muted">
                                            Creating a user on this site is
                                            subject to some terms. For details
                                            please see the privacy policy in our{" "}
                                            <Link to="/terms">
                                                Terms and Conditions
                                            </Link>
                                        </FormText>
                                    </FormGroup>
                                    {validationError}
                                    {authError}
                                    <br />
                                    {showSubmit}
                                    <br />
                                    <br />
                                    <FormGroup>
                                        <FormText muted></FormText>
                                    </FormGroup>
                                </Form>
                            }
                            {isReg &&
                                <div>
                            <p>You have successfully registered and may now <Link to="/users/login">Log In</Link>.</p>
                            </div>
                            }
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
)(UserRegisterView as any);
