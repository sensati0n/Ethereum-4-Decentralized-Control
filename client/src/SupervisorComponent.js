import React from "react";
import { Icon, Label } from 'semantic-ui-react'
import "./SupervisorComponent.css"
class SupervisorComponent extends React.Component {
    state = { dataKey: null };

    componentDidMount() {
        const { drizzle } = this.props;
        const contract = drizzle.contracts.ContractCollaborationManager;

        // let drizzle know we want to watch the `myString` method
        const dataKey = contract.methods["supervisor"].cacheCall();

        //const collaborators = contract.methods["collaboratorAddressArray"].cacheCall();
        // save the `dataKey` to local component state for later reference
        this.setState({ dataKey });
    }

    render() {
        // get the contract state from drizzleState
        const { ContractCollaborationManager } = this.props.drizzleState.contracts;

        // using the saved `dataKey`, get the variable we're interested in
        const supervisor = ContractCollaborationManager.supervisor[this.state.dataKey];

        // if it exists, then we display its value
        return (<div>Process Supervisor is:
            <span className="label-span">
                <Label>
                    <Icon name='address book outline' /> {supervisor && supervisor.value}
                </Label>
            </span>
        </div>);
    }
}

export default SupervisorComponent;
