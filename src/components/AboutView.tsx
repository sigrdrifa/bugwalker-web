import * as React from 'react';

export default class AboutView extends React.PureComponent<{}, {}> {
    public render() {
        return (
            <React.Fragment>
                <h4>About Bugwalker.io</h4>
                <hr />
                <p>Bugwalker.io is a project to facilitate the tracking of bugs for the World of Warcraft monk class.</p>
                <p>More details coming soon.</p>
            </React.Fragment>
        );
    }
}