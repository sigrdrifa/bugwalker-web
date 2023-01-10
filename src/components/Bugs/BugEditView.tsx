import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { push } from "connected-react-router";
import {
    Button,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    FormText,
    FormFeedback,
    Alert,
} from "reactstrap";
import { Link } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";

import { ApplicationState } from "../../store";
import * as BugsStore from "../../store/Bugs";
import * as AssetStore from "../../store/Assets";
import * as UserStore from "../../store/User";
import BugSpellDetail from "./BugSpellDetail";
import { getBaseTitle } from "../../store/Constants";
import { store } from "../..";

type BugEditViewProps = BugsStore.BugsState &
    typeof BugsStore.actionCreators &
    AssetStore.AssetState &
    typeof AssetStore.actionCreators &
    UserStore.UserState &
    RouteComponentProps<{ bugId?: string }>;

interface State {
    localTitle?: string;
    localDesc?: string;
    localBuild?: AssetStore.Build;
    localBuildSelect: any;
    localSpecSelected?: any;
    localTypeSelected?: any;
    localTagsSelected?: any[];
    localStatusSelected?: any;
    localSevSelected?: any;
    localStepsText?: string;
    localStepsTabSelected?: "write" | "preview" | undefined;
    localSubmitted: boolean;
}

class BugEditView extends React.PureComponent<BugEditViewProps, State> {
    state: State = {
        localTitle: this.props.bugDetail
            ? this.props.bugDetail.bugdtTitle
            : undefined,
        localDesc: this.props.bugDetail
            ? this.props.bugDetail.bugdtDescription
            : undefined,
        localBuild: undefined,
        localBuildSelect: undefined,
        localTagsSelected: this.props.bugDetail
            ? this.buildTags(this.props.bugDetail.bugdtTags)
            : undefined,
        localSevSelected: this.props.bugDetail
            ? {
                  value: this.props.bugDetail.bugdtSeverity,
                  label: this.props.bugDetail.bugdtSeverity,
                  color: this.getSeverityColour(
                      this.props.bugDetail.bugdtSeverity
                  ),
              }
            : { value: "Low", label: "Low", color: "#05b10585" },
        localStepsText: this.props.bugDetail
            ? this.props.bugDetail.bugdtContent
            : undefined,
        localStepsTabSelected: undefined,
        localSubmitted: false,
        localStatusSelected: this.props.bugDetail
            ? {
                  value: this.props.bugDetail.bugdtStatus,
                  label: this.props.bugDetail.bugdtStatus,
              }
            : { value: "Open", label: "Open" },
        localTypeSelected: this.props.bugDetail
            ? {
                  value: this.props.bugDetail.bugdtType,
                  label: this.props.bugDetail.bugdtType,
              }
            : { value: "Mechanical", label: "Mechanical" },
    };

    initialBuild?: number;
    initialSpell?: number;

    public componentDidMount() {
        document.title = "Edit Bug | " + getBaseTitle();
        if (!this.props.au) {
            // you need to be authed to edit bugs
            store.dispatch(push("/users/login"));
        }

        if (this.props.match.params.bugId) {
            console.log("fetching bugdetail");
            this.props.requestBug(parseInt(this.props.match.params.bugId));

            if (!this.props.isFetched) {
                console.log("fetching assets");
                this.props.requestAssets();

                if (!this.props.bugs || this.props.bugs.length < 1) {
                    console.log("fetching bugs");
                    this.props.requestBugs(1000);
                }
            }
        }
    }

    private buildTags(tagsStr: string) {
        if (tagsStr == null || tagsStr === undefined || tagsStr === "")
            return [];

        const tags = tagsStr.split(",");
        if (tags.length > 0)
            return tags.map((x) => {
                return { value: x, label: x };
            });
        return [{ value: tagsStr, label: tagsStr }];
    }

    private getSeverityColour(sev: string) {
        switch (sev) {
            case "Low":
                return "#05b10585";
            case "Medium":
                return "#f3f397";
            case "Critical":
                return "rgb(236, 90, 90)";
            default:
                return "#05b10585";
        }
    }

    // EVENT HANDLERS
    private handleTitleChanged(e: any) {
        e.preventDefault();
        this.setState({ localTitle: e.target.value });
    }

    private handleDescChanged(e: any) {
        e.preventDefault();
        this.setState({ localDesc: e.target.value });
    }

    private handleBuildChange(bo: any) {
        console.log("Build selected", bo);
        this.setState({
            localBuild: bo.value as AssetStore.Build,
            localBuildSelect: bo,
        });
    }

    private handleSpecChange(so: any) {
        console.log("Spec selected", so);
        this.setState({
            localSpecSelected: so,
        });
    }

    private handleTypeChange(so: any) {
        console.log("Type selected", so);
        this.setState({
            localTypeSelected: so,
        });
    }

    private handleTagsChange(newValue: any, actionMeta: any) {
        this.setState({ localTagsSelected: newValue });
    }

    private handleSevChange(so: any) {
        console.log("Sev selected", so);
        this.setState({
            localSevSelected: so,
        });
    }

    private handleStatusChange(so: any) {
        this.setState({
            localStatusSelected: so,
        });
    }

    private handleEditorChange(so: string) {
        this.setState({ localStepsText: so });
    }

    private onEditorTabChange(t: any) {
        console.log("oneditortabchange");
        this.setState({ localStepsTabSelected: t });
    }

    private onSubmit() {
        console.log(this.state);
        const submitBuild = this.state.localBuild
            ? this.state.localBuild.buildIdT
            : this.initialBuild;

        let tagsStr = "";

        if (
            this.state.localTagsSelected &&
            this.state.localTagsSelected.length > 0
        ) {
            tagsStr = this.state.localTagsSelected
                .reduce((a: any, x: any) => {
                    return a + "," + x.value.toLowerCase();
                }, "")
                .substring(1);
        }

        console.log("tags", tagsStr);

        let userId;
        if (this.props.au) {
            userId = this.props.au.auId;
        }
        console.log(userId);

        const bd: BugsStore.BugDetail = {
            bugdtId: this.props.bugDetail ? this.props.bugDetail.bugdtId : -1,
            bugdtDateCreated: "",
            bugdtDateModified: "",
            bugdtSeverity: this.state.localSevSelected
                ? this.state.localSevSelected.value
                : "Low",
            bugdtType: this.state.localTypeSelected
                ? this.state.localTypeSelected.value
                : "Visual",
            bugdtTitle: this.state.localTitle ? this.state.localTitle : "",
            bugdtStatus: this.state.localStatusSelected
                ? this.state.localStatusSelected.value
                : "Open",
            bugdtTags: tagsStr,
            bugdtSpellId: this.props.bugDetail
                ? this.props.bugDetail.bugdtSpellId
                : -1,
            bugdtBuildId: submitBuild ? submitBuild : -1,
            bugdtSpec: this.state.localSpecSelected
                ? this.state.localSpecSelected.value
                : "All",
            bugdtDescription: this.state.localDesc ? this.state.localDesc : "",
            bugdtSteps: "",
            bugdtContent: this.state.localStepsText
                ? this.state.localStepsText
                : "",
            bugdtBlueTrackerLink: "",
            bugdtSubmitter: userId ? userId : -1,
        };

        const bId = this.props.bugDetail ? this.props.bugDetail.bugdtId : -1;
        console.log(bId, bd);
        this.props.editBug(bId, bd);
    }

    private getFormFeedback(
        field: string,
        val: string | undefined
    ): [boolean | undefined, JSX.Element] {
        switch (field) {
            case "title":
                if (val) {
                    if (val.length > 200)
                        return [
                            true,
                            <FormFeedback invalid>
                                Please enter a shorter title
                            </FormFeedback>,
                        ];
                    if (val.length < 30)
                        return [
                            true,
                            <FormFeedback invalid>
                                Please give a more descriptive (longer) title
                            </FormFeedback>,
                        ];
                } else
                    return [
                        true,
                        <FormFeedback invalid>
                            Please enter a Title for the Bug
                        </FormFeedback>,
                    ];
                break;
            case "desc":
                if (val) {
                    if (val.length > 400)
                        return [
                            true,
                            <FormFeedback invalid>
                                Please enter a shorter description
                            </FormFeedback>,
                        ];
                    if (val.length < 50)
                        return [
                            true,
                            <FormFeedback invalid>
                                Please give a slightly longer description{" "}
                            </FormFeedback>,
                        ];
                } else
                    return [
                        true,
                        <FormFeedback invalid>
                            Please enter a brief Description of the Bug
                        </FormFeedback>,
                    ];
                break;
            case "tags":
                if (val) {
                    if (val.split(",").length > 5)
                        return [
                            true,
                            <p
                                className="invalid-feedback"
                                style={{
                                    display: "block",
                                    marginTop: "0.5rem",
                                }}
                            >
                                Please specify no more than 5 tags
                            </p>,
                        ];
                }
                return [false, <FormFeedback valid></FormFeedback>];
            default:
                return [false, <FormFeedback valid></FormFeedback>];
        }
        return [false, <FormFeedback></FormFeedback>];
    }

    public render() {
        let spell, initialBuild, buildOptions;
        const paramBugId = this.props.match.params.bugId;
        let canUserEdit = this.props.au ? this.props.au.auRole > 3 : false;
        if (paramBugId) {
            if (
                this.props.bugDetail &&
                parseInt(paramBugId) === this.props.bugDetail.bugdtId
            ) {
                const bugSpellId = this.props.bugDetail.bugdtSpellId;
                const bugbuildId = this.props.bugDetail.bugdtBuildId;
                spell = this.props.spells.find(
                    (x) => x.spellIdT === bugSpellId
                );

                if (this.props.au) {
                    canUserEdit =
                        canUserEdit ||
                        this.props.bugDetail.bugdtSubmitter ===
                            this.props.au.auId;
                }

                if (this.props.builds) {
                    const s = this.props.builds.find(
                        (x) => x.buildIdT === bugbuildId
                    );
                    if (s)
                        initialBuild = {
                            value: s,
                            label: `${s.buildStringT} (${s.buildDateT})`,
                        };
                }
            }
        }

        if (this.props.builds) {
            buildOptions = this.props.builds.map((x) => {
                return {
                    value: x,
                    label: `${x.buildStringT} (${x.buildDateT})`,
                };
            });
        }

        const typeOptions = [
            { value: "Visual", label: "Visual" },
            { value: "Mechanical", label: "Mechanical" },
            { value: "Gameplay", label: "Gameplay" },
            { value: "System", label: "System" },
        ];

        const tagOptions = [
            { value: "legendary", label: "Legendary" },
            { value: "conduit", label: "Conduit" },
            { value: "covenant", label: "Covenant" },
            { value: "pve", label: "PvE" },
            { value: "pvp", label: "PvP" },
        ];

        const sevOptions = [
            { value: "Low", label: `Low`, color: "#05b10585" },
            { value: "Medium", label: "Medium", color: "#f3f397" },
            { value: "Critical", label: "Critical", color: "rgb(236, 90, 90)" },
        ];

        const statusOptions = [
            { value: "Open", label: "Open" },
            { value: "Closed", label: "Closed" },
        ];

        const selectStyle = {
            option: (styles: any, state: any) => ({
                ...styles,
                color: state.isSelected ? "#FFF" : styles.color,
                backgroundColor: state.isSelected ? "#77acbd" : styles.color,
                borderBottom: "1px solid rgba(0, 0, 0, 0.125)",
                "&:hover": {
                    color: "#FFF",
                    backgroundColor: "#77acbd",
                },
            }),
            control: (styles: any, state: any) => ({
                ...styles,
                boxShadow: state.isFocused
                    ? "0 0 0 0.2rem rgb(27, 109, 133, 0.25)"
                    : 0,
                borderColor: state.isFocused ? "#1b6d85" : "#CED4DA",
                "&:hover": {
                    borderColor: state.isFocused ? "#1b6d85" : "#CED4DA",
                },
            }),
        };

        const dot = (color = "#ccc") => ({
            alignItems: "center",
            display: "flex",

            ":before": {
                backgroundColor: color,
                borderRadius: 10,
                content: '" "',
                display: "block",
                marginRight: 8,
                height: 10,
                width: 10,
            },
        });
        const colourStyles = {
            control: (styles: any, state: any) => ({
                ...styles,
                backgroundColor: "white",
                boxShadow: state.isFocused
                    ? "0 0 0 0.2rem rgb(27, 109, 133, 0.25)"
                    : 0,
                borderColor: state.isFocused ? "#1b6d85" : "#CED4DA",
                "&:hover": {
                    borderColor: state.isFocused ? "#1b6d85" : "#CED4DA",
                },
            }),
            option: (
                styles: any,
                { data, isDisabled, isFocused, isSelected }: any
            ) => {
                const color = data.color;
                return {
                    ...styles,
                    backgroundColor: isDisabled
                        ? null
                        : isSelected
                        ? data.color
                        : isFocused
                        ? color
                        : null,
                    color: isDisabled ? "#ccc" : isSelected ? "black" : "black",
                    cursor: isDisabled ? "not-allowed" : "default",
                    ":active": {
                        ...styles[":active"],
                        backgroundColor:
                            !isDisabled && (isSelected ? data.color : color),
                    },
                };
            },
            input: (styles: any) => ({ ...styles, ...dot() }),
            placeholder: (styles: any) => ({ ...styles, ...dot() }),
            singleValue: (styles: any, { data }: any) => ({
                ...styles,
                ...dot(data.color),
            }),
        };

        // VALIDATION

        const [titleInvalid, titleValidation] = this.getFormFeedback(
            "title",
            this.state.localTitle
        );
        const [descInvalid, descValidation] = this.getFormFeedback(
            "desc",
            this.state.localDesc
        );

        let tagsStr = "";
        if (this.state.localTagsSelected) {
            tagsStr = this.state.localTagsSelected
                .reduce((a: any, x: any) => {
                    return a + "," + x.value.toLowerCase();
                }, "")
                .substring(1);
        }

        const [tagsInvalid, tagsValidation] = this.getFormFeedback(
            "tags",
            tagsStr
        );
        const submitEnabled = !titleInvalid && !descInvalid && !tagsInvalid;

        return (
            <React.Fragment>
                <Row>
                    <Col md="2"></Col>
                    <Col md="8" className="submit-bug-col">
                        {!canUserEdit && (
                            <div>
                                <br />
                                <h4>Whoops, you are not allowed to do that.</h4>
                                <br />
                                <Alert color="danger">
                                    <FontAwesomeIcon icon={faTimesCircle} />{" "}
                                    Nice try, Demon Hunter! You are not
                                    authorised to edit this bug.
                                </Alert>
                                <br />
                                <Link
                                    className="btn btn-primary"
                                    style={{
                                        backgroundColor: "rgb(27, 109, 133)",
                                    }}
                                    to="/bugs"
                                >
                                    {" "}
                                    &lt; Back to bugs
                                </Link>
                            </div>
                        )}

                        {canUserEdit && (
                            <div className="edit-bug-view">
                                <h2>
                                    <FontAwesomeIcon icon={faBug} /> Edit Bug
                                </h2>
                                <br />
                                <p>
                                    On this page you can edit an existing
                                    bugwalker bug, but please note that not all
                                    fields can be edited. If you need to change
                                    the affected spell for example, then please
                                    file a new bug and archive this one.
                                </p>
                                <p>
                                    If you require any help along the way, be
                                    sure to check the{" "}
                                    <Link to="/help#edit-bug">
                                        Edit bug help section
                                    </Link>
                                    .
                                </p>
                                <hr />
                                <Form>
                                    <h4>General</h4>
                                    <br />
                                    <Row>
                                        <Col md="4">
                                            <FormGroup>
                                                <Label for="bugSev">
                                                    Bug Status
                                                </Label>
                                                <Select
                                                    id="bugSev"
                                                    defaultValue={
                                                        statusOptions[0]
                                                    }
                                                    value={
                                                        this.state
                                                            .localStatusSelected
                                                            ? this.state
                                                                  .localStatusSelected
                                                            : statusOptions[0]
                                                    }
                                                    onChange={this.handleStatusChange.bind(
                                                        this
                                                    )}
                                                    options={statusOptions}
                                                    styles={colourStyles}
                                                />
                                                <FormText color="muted">
                                                    Use this dropdown to change
                                                    the Status of the bug e.g.
                                                    to Close it.
                                                </FormText>
                                            </FormGroup>
                                        </Col>
                                        <Col md="4"></Col>
                                        <Col md="4">
                                            <FormGroup>
                                                <Label for="bugBuild">
                                                    Build
                                                </Label>
                                                <Select
                                                    id="bugBuild"
                                                    styles={selectStyle}
                                                    defaultValue={initialBuild}
                                                    value={
                                                        this.state
                                                            .localBuildSelect
                                                            ? this.state
                                                                  .localBuildSelect
                                                            : initialBuild
                                                    }
                                                    onChange={this.handleBuildChange.bind(
                                                        this
                                                    )}
                                                    options={buildOptions}
                                                />
                                                <FormText color="muted">
                                                    Select the WoW Build for the
                                                    bug, the latest build is
                                                    selected by default.
                                                </FormText>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <br />
                                    <FormGroup>
                                        <Label for="bugTitle">Title</Label>
                                        <Input
                                            invalid={titleInvalid}
                                            valid={!titleInvalid}
                                            value={this.state.localTitle}
                                            onChange={this.handleTitleChanged.bind(
                                                this
                                            )}
                                            type="text"
                                            name="email"
                                            id="bugTitle"
                                            placeholder="e.g. Fists of Fury cancels in protest when I listen to K-Pop"
                                        />
                                        {titleValidation}
                                        <FormText color="muted">
                                            The unique title of the bug, please
                                            keep this below 200 characters.
                                        </FormText>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="bugDescription">
                                            Short Description
                                        </Label>
                                        <Input
                                            invalid={descInvalid}
                                            valid={!descInvalid}
                                            value={this.state.localDesc}
                                            onChange={this.handleDescChanged.bind(
                                                this
                                            )}
                                            type="textarea"
                                            name="bugDescription"
                                            id="bugDescription"
                                        />
                                        {descValidation}
                                        <FormText color="muted">
                                            Please give a brief, general
                                            description of your bug. Note that
                                            reproducing steps and details have
                                            their own fields below. Max 400
                                            Characters.
                                        </FormText>
                                    </FormGroup>

                                    <h4>Spell</h4>
                                    <p>
                                        It is not possible to change the
                                        affecting spell of a bug, please file a
                                        new one if this is required.
                                    </p>
                                    <b>Affecting Spell (cannot be changed):</b>
                                    <BugSpellDetail spell={spell} />
                                    <br />
                                    <hr />
                                    <h4>Meta Data</h4>
                                    <br />
                                    <Row>
                                        <Col md="4">
                                            <FormGroup>
                                                <Label for="bugType">
                                                    Type
                                                </Label>
                                                <Select
                                                    id="bugType"
                                                    styles={selectStyle}
                                                    defaultValue={
                                                        typeOptions[0]
                                                    }
                                                    value={
                                                        this.state
                                                            .localTypeSelected
                                                            ? this.state
                                                                  .localTypeSelected
                                                            : typeOptions[0]
                                                    }
                                                    onChange={this.handleTypeChange.bind(
                                                        this
                                                    )}
                                                    options={typeOptions}
                                                />
                                                <FormText color="muted">
                                                    Please select the Type that
                                                    best describes the bug.
                                                </FormText>
                                            </FormGroup>
                                        </Col>
                                        <Col md="4">
                                            <FormGroup>
                                                <Label for="bugTags">
                                                    Tags
                                                </Label>
                                                <CreatableSelect
                                                    styles={selectStyle}
                                                    id="bugTags"
                                                    isMulti
                                                    value={
                                                        this.state
                                                            .localTagsSelected
                                                    }
                                                    onChange={this.handleTagsChange.bind(
                                                        this
                                                    )}
                                                    options={tagOptions}
                                                />
                                                {tagsValidation}
                                                <FormText color="muted">
                                                    Select additional tags to
                                                    describe your bug or create
                                                    new ones.
                                                </FormText>
                                            </FormGroup>
                                        </Col>
                                        <Col md="4">
                                            <FormGroup>
                                                <Label for="bugSev">
                                                    Severity
                                                </Label>
                                                <Select
                                                    id="bugSev"
                                                    defaultValue={sevOptions[0]}
                                                    value={
                                                        this.state
                                                            .localSevSelected
                                                            ? this.state
                                                                  .localSevSelected
                                                            : sevOptions[0]
                                                    }
                                                    onChange={this.handleSevChange.bind(
                                                        this
                                                    )}
                                                    options={sevOptions}
                                                    styles={colourStyles}
                                                />
                                                <FormText color="muted">
                                                    Pick the Severity that best
                                                    describes the bug.
                                                </FormText>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <br />
                                    <h4>
                                        Steps to reproduce and Details
                                        (Optional)
                                    </h4>
                                    <p>
                                        The section below can be used to give
                                        detailed instructions on how to
                                        reproduce the bug as well as detailed
                                        descriptions of bug internals. The
                                        editor supports markdown notation
                                        including the ability to link to
                                        external images.
                                    </p>
                                    <ReactMde
                                        minEditorHeight={400}
                                        value={this.state.localStepsText}
                                        onChange={this.handleEditorChange.bind(
                                            this
                                        )}
                                        onTabChange={this.onEditorTabChange.bind(
                                            this
                                        )}
                                        selectedTab={
                                            this.state.localStepsTabSelected
                                        }
                                        generateMarkdownPreview={(markdown) =>
                                            Promise.resolve(
                                                <ReactMarkdown
                                                    source={markdown}
                                                />
                                            )
                                        }
                                    />
                                    <br />
                                    <Button
                                        disabled={!submitEnabled}
                                        primary
                                        style={{
                                            backgroundColor:
                                                "rgb(27, 109, 133)",
                                        }}
                                        onClick={this.onSubmit.bind(this)}
                                    >
                                        <FontAwesomeIcon icon={faBug} /> Update
                                        Bug
                                    </Button>
                                    {!submitEnabled && (
                                        <div className="submit-invalid-feedback">
                                            Please resolve any validation errors
                                            before attempting to submit your
                                            bug.
                                        </div>
                                    )}
                                    {submitEnabled && (
                                        <div className="submit-valid">
                                            Your updated bug is ready to be
                                            submitted!
                                        </div>
                                    )}
                                    <br />
                                    <br />
                                </Form>
                            </div>
                        )}
                        <br />
                    </Col>
                    <Col md="2"></Col>
                </Row>
            </React.Fragment>
        );
    }
}

export default connect(
    (state: ApplicationState) => {
        return { ...state.bugs, ...state.assets, ...state.user };
    },
    { ...BugsStore.actionCreators, ...AssetStore.actionCreators }
)(BugEditView as any);
