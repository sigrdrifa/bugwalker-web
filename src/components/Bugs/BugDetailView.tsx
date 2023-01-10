import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Helmet } from "react-helmet";

import { ApplicationState } from '../../store';
import * as BugsStore from '../../store/Bugs';
import * as AssetStore from '../../store/Assets';
import * as UserStore from '../../store/User';
import BugDetailRender from './BugDetailRender';
import { getBaseTitle } from '../../store/Constants';

type BugDetailViewProps =
    BugsStore.BugsState
    & typeof BugsStore.actionCreators
    & AssetStore.AssetState
    & typeof AssetStore.actionCreators
    & UserStore.UserState
    & RouteComponentProps<{ bugId?: string }>;

class BugDetailView extends React.PureComponent<BugDetailViewProps> {
    public componentDidMount() {
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

    public componentDidUpdate(prevProps: BugDetailViewProps) {
        if (this.props.match.params.bugId !== prevProps.match.params.bugId) {
            // looks like we requested a new bug
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
    }


    public render() {
        let bugDetail: any = "No Bug loaded";
        const paramBugId = this.props.match.params.bugId
        let bugId = 0;
        let bugTitle = "Bug";
        let spell;
        let canViewPending = this.props.bugDetail && this.props.bugDetail.bugdtStatus !== "Pending";

        if (paramBugId) {
            if (this.props.bugDetail
                && parseInt(paramBugId) === this.props.bugDetail.bugdtId) {

                //document.title = this.props.bugDetail.bugdtTitle.slice(0, 50) + " | " + getBaseTitle();
                bugTitle = this.props.bugDetail.bugdtTitle.slice(0, 75) + " | " + getBaseTitle();
                const bugSpellId = this.props.bugDetail.bugdtSpellId;
                bugId = this.props.bugDetail.bugdtId;
                spell = this.props.spells.find(x => x.spellIdT === bugSpellId);
                let bug = this.props.bugs.find(x => x.bugId === bugId);
                const isMod = this.props.au ? this.props.au.auRole > 3 : false;
                let canEdit = false;
                if (this.props.au) {
                    canEdit = isMod || this.props.bugDetail.bugdtSubmitter === this.props.au.auId;
                    canViewPending = canEdit || this.props.bugDetail.bugdtStatus !== "Pending";
                }
                bugDetail = <BugDetailRender bugDetail={this.props.bugDetail} bugSpell={spell} bug={bug} canEdit={canEdit} isMod={isMod} dispatchDelete={this.props.deleteBug} />;

            }
            else if (this.props.isFetching) {
                bugDetail = "Loading...";
            }
            if (!this.props.isFetching && !canViewPending) {
                bugDetail = (<p>This bug is pending verification and cannot be viewed by you yet.</p>);
            }
        }


        return (
            <React.Fragment>
                <Helmet>
                    <title>{bugTitle}</title>
                    <meta name="description" content={bugTitle} />
                    {spell &&
                    <meta property="og:description" content={"Bugtracker submitted bug for Spell: " + spell.spellNameT} />
                    }
                    <meta property="og:title" content={bugTitle} />
                    {spell &&
                    <meta property="og:image" content={"https://bugwalker.io/assets/img/spells/" + spell.spellIdT + ".jpg"} />
                    }
                </Helmet>
                {bugDetail}

                <br />
            </React.Fragment>
        );
    }
};

export default connect(
    (state: ApplicationState) => { return { ...state.bugs, ...state.assets, ...state.user }; },
    { ...BugsStore.actionCreators, ...AssetStore.actionCreators }
)(BugDetailView as any);

