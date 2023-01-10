import * as React from "react";
import { connect } from "react-redux";
import { faCubes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ApplicationState } from "../store";
import { getBaseTitle } from "../store/Constants";
import * as AssetStore from "../store/Assets";

type GameAssetsViewProps = AssetStore.AssetState &
  typeof AssetStore.actionCreators;

class AplView extends React.PureComponent<GameAssetsViewProps> {
  public componentDidMount() {
    document.title = "APL | " + getBaseTitle();
    this.ensureDataFetched();
  }

  public render() {
    return (
      <React.Fragment>
        <h4>
          <FontAwesomeIcon icon={faCubes}></FontAwesomeIcon> APL
        </h4>
        <br />
        <p>Coming soon (tm).</p>
      </React.Fragment>
    );
  }

  private ensureDataFetched() {
    if (!this.props.isFetched) {
      this.props.requestAssets();
    }
  }
}

export default connect(
  (state: ApplicationState) => state.assets,
  AssetStore.actionCreators
)(AplView as any);
