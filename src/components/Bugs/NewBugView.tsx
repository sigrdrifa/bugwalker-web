import * as React from "react";
import { connect } from "react-redux";
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
    Alert
} from "reactstrap";
import { Link } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug } from "@fortawesome/free-solid-svg-icons";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { push } from "connected-react-router";

import { ApplicationState } from "../../store";
import * as AssetStore from "../../store/Assets";
import * as BugsStore from "../../store/Bugs";
import * as UserStore from "../../store/User";
import { getBaseTitle } from "../../store/Constants";
import "./NewBugView.css";
import { store } from "../..";
import BugSpellDetail from "./BugSpellDetail";

type NewBugViewProps = AssetStore.AssetState &
    typeof AssetStore.actionCreators &
    BugsStore.BugsState &
    typeof BugsStore.actionCreators &
    UserStore.UserState;

interface State {
    localTitle?: string;
    localDesc?: string;
    localSpell?: AssetStore.Spell;
    localSpellSelect: any;
    localBuild?: AssetStore.Build;
    localBuildSelect: any;
    localSpecSelected?: any;
    localTypeSelected?: any;
    localTagsSelected?: [any];
    localSevSelected?: any;
    localStepsText?: string;
    localStepsTabSelected?: "write" | "preview" | undefined;
    localSubmitted: boolean;
}

class NewBugView extends React.PureComponent<NewBugViewProps, State> {
    state: State = {
        localTitle: undefined,
        localDesc: undefined,
        localSpell: undefined,
        localBuild: undefined,
        localSpellSelect: undefined,
        localBuildSelect: undefined,
        localTagsSelected: undefined,
        localSevSelected: { value: "Low", label: "Low", color: "#05b10585" },
        localStepsText: undefined,
        localStepsTabSelected: undefined,
        localSpecSelected: {
            value: "All",
            label: (
                <div>
                    <img
                        className="img-circle"
                        src="/assets/img/spec/monk.jpg"
                        alt="Monk"
                    />{" "}
                    Monk (All)
                </div>
            ),
        },
        localSubmitted: false,
        localTypeSelected: { value: "Mechanical", label: "Mechanical" },
    };

    initialBuild?: number;
    initialSpell?: number;

    public componentDidUpdate(prevProps: NewBugViewProps) {
        console.log("Checking assets...");
        if (!this.props.isFetched) {
            console.log("fetching assets");
            this.props.requestAssets();
        }
    }

    public componentDidMount() {
        document.title = " Submit new Bug | " + getBaseTitle();
        console.log("Checking assets...");
        if (!this.props.au) {
            // you need to be authed to submit bugs
            store.dispatch(push("/users/login"));
        }

        if (!this.props.isFetched) {
            console.log("fetching assets");
            this.props.requestAssets();
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

    private handleChange(so: any) {
        console.log(`Option selected:`, so);
        this.setState({
            localSpell: so.value as AssetStore.Spell,
            localSpellSelect: so,
        });
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

    private handleEditorChange(so: string) {
        this.setState({ localStepsText: so });
    }

    private onEditorTabChange(t: any) {
        console.log("oneditortabchange");
        this.setState({ localStepsTabSelected: t });
    }

    private onSubmit() {
        console.log(this.state);

        const submitSpell = this.state.localSpell
            ? this.state.localSpell.spellIdT
            : this.initialSpell;
        const submitBuild = this.state.localBuild
            ? this.state.localBuild.buildIdT
            : this.initialBuild;

        console.log(submitSpell, submitBuild);

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

        let userId;
        if (this.props.au) {
            userId = this.props.au.auId;
        }
        console.log(userId);

        const bd: BugsStore.BugDetail = {
            bugdtId: -1,
            bugdtDateCreated: "",
            bugdtDateModified: "",
            bugdtSeverity: this.state.localSevSelected
                ? this.state.localSevSelected.value
                : "Low",
            bugdtType: this.state.localTypeSelected
                ? this.state.localTypeSelected.value
                : "Visual",
            bugdtTitle: this.state.localTitle ? this.state.localTitle : "",
            bugdtStatus: "Open",
            bugdtTags: tagsStr,
            bugdtSpellId: submitSpell ? submitSpell : -1,
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

        console.log(bd);
        this.props.submitBug(bd);
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
        let spellOptions;
        let buildOptions;
        let spellSelected;
        let initialBuild;
        let initialSpell;
        if (this.props.spells) {
            spellOptions = this.props.spells.map((x) => {
                return { value: x, label: `${x.spellNameT} (${x.spellIdT})` };
            });
            let chiBurst = this.props.spells.find((x) => x.spellIdT === 123986);
            if (chiBurst)
                initialSpell = {
                    value: chiBurst,
                    label: `${chiBurst.spellNameT} (${chiBurst.spellIdT})`,
                };
            if (this.state.localSpell || chiBurst) {
                console.log("populating localspell", this.state.localSpell);
                const s = this.state.localSpell || chiBurst;
                if (s) {
                    this.initialSpell = s.spellIdT;
                    spellSelected = <BugSpellDetail spell={s} />;
                }
            }
        }
        if (this.props.builds) {
            const s = this.props.builds.slice(-1)[0];
            if (s) {
                initialBuild = {
                    value: s,
                    label: `${s.buildStringT} (${s.buildDateT})`,
                };
                this.initialBuild = s.buildIdT;
            } else {
                this.initialBuild = -1;
            }
            buildOptions = this.props.builds.map((x) => {
                return {
                    value: x,
                    label: `${x.buildStringT} (${x.buildDateT})`,
                };
            });
        }

        const specOptions = [
            {
                value: "All",
                label: (
                    <div>
                        <img
                            className="img-circle"
                            src="/assets/img/spec/monk.jpg"
                            alt="Monk"
                        />{" "}
                        Monk (All)
                    </div>
                ),
            },
            {
                value: "Brewmaster",
                label: (
                    <div>
                        <img
                            className="img-circle"
                            src="/assets/img/spec/brewmaster.jpg"
                            alt="Brewmaster"
                        />{" "}
                        Brewmaster
                    </div>
                ),
            },
            {
                value: "Mistweaver",
                label: (
                    <div>
                        <img
                            className="img-circle"
                            src="/assets/img/spec/mistweaver.jpg"
                            alt="Mistweaver"
                        />{" "}
                        Mistweaver
                    </div>
                ),
            },
            {
                value: "Windwalker",
                label: (
                    <div>
                        <img
                            className="img-circle"
                            src="/assets/img/spec/windwalker.jpg"
                            alt="Windwalker"
                        />{" "}
                        Windwalker
                    </div>
                ),
            },
        ];

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
                    <Col md="1" sm="0"></Col>
                    <Col md="10" sm="12" className="submit-bug-col">
                        <h2>
                            <FontAwesomeIcon icon={faBug} /> Submit a new Bug
                        </h2>
                        <Alert color="warning">Before submitting a bug, please check existing bug reports to see if your report can be included with another to consolidate reports and avoid duplicates.</Alert>
                        <br />
                        <p>
                            On this page you can submit a new bug to be tracked
                            in the Bugwalker. We would appreciate if you take
                            the time to give detailed, relevant information on
                            the bug including a description, steps to reproduce
                            if possible and which game asset the bug relates to.
                        </p>
                        <p>
                            If you require any help along the way, be sure to
                            check the{" "}
                            <Link to="/help#submit-bug">
                                Submit bug help section
                            </Link>
                            .
                        </p>
                        <hr />
                        <Form>
                            <h4>General</h4>
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
                                    The unique title of the bug, please keep
                                    this below 200 characters.
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
                                    onChange={this.handleDescChanged.bind(this)}
                                    type="textarea"
                                    name="bugDescription"
                                    id="bugDescription"
                                />
                                {descValidation}
                                <FormText color="muted">
                                    Please give a brief, general description of
                                    your bug. Note that reproducing steps and
                                    details have their own fields below. Max 400
                                    Characters.
                                </FormText>
                            </FormGroup>
                            <h4>Spell</h4>
                            <br />
                            <Row>
                                <Col md="4">
                                    <FormGroup>
                                        <Label for="bugSpec">
                                            Specialisation
                                        </Label>
                                        <Select
                                            id="bugSpec"
                                            styles={selectStyle}
                                            defaultValue={specOptions[0]}
                                            value={
                                                this.state.localSpecSelected
                                                    ? this.state
                                                          .localSpecSelected
                                                    : specOptions[0]
                                            }
                                            onChange={this.handleSpecChange.bind(
                                                this
                                            )}
                                            options={specOptions}
                                        />
                                        <FormText color="muted">
                                            Select the Monk Specialisation that
                                            your bug relates to or pick All.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="4">
                                    <FormGroup>
                                        <Label for="bugSpell">Spell</Label>
                                        <Select
                                            id="bugSpell"
                                            styles={selectStyle}
                                            defaultValue={initialSpell}
                                            value={
                                                this.state.localSpellSelect
                                                    ? this.state
                                                          .localSpellSelect
                                                    : initialSpell
                                            }
                                            onChange={this.handleChange.bind(
                                                this
                                            )}
                                            options={spellOptions}
                                        />
                                        <FormText color="muted">
                                            Select the Monk Spell that your bug
                                            is related to (you can type to
                                            filter the dropdown).
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="4">
                                    <FormGroup>
                                        <Label for="bugBuild">Build</Label>
                                        <Select
                                            id="bugBuild"
                                            styles={selectStyle}
                                            defaultValue={initialBuild}
                                            value={
                                                this.state.localBuildSelect
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
                                            Select the WoW Build for the bug,
                                            the latest build is selected by
                                            default.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                            </Row>
                            {spellSelected}
                            <br />
                            <hr />
                            <h4>Meta Data</h4>
                            <br />
                            <Row>
                                <Col md="4">
                                    <FormGroup>
                                        <Label for="bugType">Type</Label>
                                        <Select
                                            id="bugType"
                                            styles={selectStyle}
                                            defaultValue={typeOptions[0]}
                                            value={
                                                this.state.localTypeSelected
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
                                            Please select the Type that best
                                            describes the bug.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="4">
                                    <FormGroup>
                                        <Label for="bugTags">Tags</Label>
                                        <CreatableSelect
                                            invalid={tagsInvalid}
                                            styles={selectStyle}
                                            id="bugTags"
                                            isMulti
                                            value={this.state.localTagsSelected}
                                            onChange={this.handleTagsChange.bind(
                                                this
                                            )}
                                            options={tagOptions}
                                        />
                                        {tagsValidation}
                                        <FormText color="muted">
                                            Select additional tags to describe
                                            your bug or create new ones.
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="4">
                                    <FormGroup>
                                        <Label for="bugSev">Severity</Label>
                                        <Select
                                            id="bugSev"
                                            defaultValue={sevOptions[0]}
                                            value={
                                                this.state.localSevSelected
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
                            <h4>Steps to reproduce and Details (Optional)</h4>
                            <p>
                                The section below can be used to give detailed
                                instructions on how to reproduce the bug as well
                                as detailed descriptions of bug internals. The
                                editor supports markdown notation including the
                                ability to link to external images.
                            </p>
                            <ReactMde
                                minEditorHeight={400}
                                value={this.state.localStepsText}
                                onChange={this.handleEditorChange.bind(this)}
                                onTabChange={this.onEditorTabChange.bind(this)}
                                selectedTab={this.state.localStepsTabSelected}
                                generateMarkdownPreview={(markdown) =>
                                    Promise.resolve(
                                        <ReactMarkdown source={markdown} />
                                    )
                                }
                            />
                            <br />
                            <Button
                                disabled={!submitEnabled}
                                primary
                                style={{ backgroundColor: "rgb(27, 109, 133)" }}
                                onClick={this.onSubmit.bind(this)}
                            >
                                <FontAwesomeIcon icon={faBug} /> Submit Bug
                            </Button>
                            {!submitEnabled && (
                                <div className="submit-invalid-feedback">
                                    Please resolve any validation errors before
                                    attempting to submit your bug.
                                </div>
                            )}
                            {submitEnabled && (
                                <div className="submit-valid">
                                    Your bug is ready to be submitted!
                                </div>
                            )}
                            <br />
                            <br />
                        </Form>
                    </Col>
                    <Col md="1" sm="0"></Col>
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
)(NewBugView as any);
