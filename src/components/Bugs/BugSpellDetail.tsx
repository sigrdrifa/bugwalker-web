import * as React from 'react';
import { Media } from 'reactstrap';

import * as AssetStore from '../../store/Assets';

type BugSpellDetailProps =
    {
        spell?: AssetStore.Spell
    }

class BugSpellDetail extends React.PureComponent<BugSpellDetailProps> {

    public render() {
        const s = this.props.spell;
        return (
            <React.Fragment>
                {s && <Media className="selected-spell-media">
                    <Media left>
                        <img src={"/assets/img/spells/" + s.spellIdT + ".jpg"} alt={s.spellNameT} />
                    </Media>
                    <Media body>
                        <Media heading>
                            {s.spellNameT}
                        </Media>
                        {s.spellDescT}
                    </Media>
                </Media>
                }
                {!s &&
                    <p>No spell supplied.</p>
                }
            </React.Fragment>
        );
    }
};

export default BugSpellDetail;
