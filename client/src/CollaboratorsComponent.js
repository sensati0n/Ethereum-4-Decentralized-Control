import React from "react";
import { Dropdown, Input } from 'semantic-ui-react'
import './CollaboratorsComponent.css';

class CollaboratorsComponent extends React.Component {
    state = {
        stackId: null,
        collaborator: '',
        collaboratorDescription: ''
    };

    constructor(props) {
        super(props);
        this.setValue = this.setValue.bind(this);
    }

    setValue = value => {
        const { drizzle, drizzleState } = this.props;
        const contract = drizzle.contracts.ContractCollaborationManager;
        // let drizzle know we want to call the `set` method with `value`
        const stackId = contract.methods.addCollaborator.cacheSend(this.state.collaborator, this.state.collaboratorDescription, {
            from: drizzleState.accounts[0],
            gas: 600000
        });

        // save the `stackId` for later reference
        this.setState({ stackId, collaborator: '', collaboratorDescription: '' });
    }

    componentDidMount() {
        const { drizzle } = this.props;
        const contract = drizzle.contracts.ContractCollaborationManager;

        // let drizzle know we want to watch the `myString` method
        const dataKey = contract.methods.getCollaborators.cacheCall();

        //const collaborators = contract.methods["collaboratorAddressArray"].cacheCall();
        // save the `dataKey` to local component state for later reference
        this.setState({ dataKey });
    }

    getAccountsDropdownObject() {
        let accountOject = [];
        let drizzleAccounts = this.props.drizzleState.accounts;
        for (let acc in drizzleAccounts) {
            accountOject.push({ key: drizzleAccounts[acc], text: acc + ":\t" + drizzleAccounts[acc], value: drizzleAccounts[acc] })
        }
        return accountOject;
    }

    render() {
        let options = this.getAccountsDropdownObject();
        return (
            <div className="add-collaborater-container">
                <div className="collaborator-input">
                    <Dropdown placeholder='Account' onChange={
                        (event, data) => {
                            this.setState({ collaborator: data.value });
                        }
                    } fluid selection options={options} value={this.state.collaborator} />
                </div>
                <div className="add-task-label">
                    <Input fluid placeholder='Name' onChange={
                        (event, data) => {
                            this.setState({ collaboratorDescription: data.value });
                        }} value={this.state.collaboratorDescription} />
                </div>
                <button type="button" onClick={this.setValue}>
                    Add Collborator
                 </button>
            </div>
        );
    }
}

export default CollaboratorsComponent;