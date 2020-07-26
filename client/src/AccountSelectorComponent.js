import React from "react";
import { Dropdown, Icon } from 'semantic-ui-react'

class AccountSelectorComponent extends React.Component {
    state = {
        stackId: null,
        collaborator: null
    };

    constructor(props) {
        super(props);
        this.getCollaboratorsDropDown = this.getCollaboratorsDropDown.bind(this);
        this.setupUseCase = this.setupUseCase.bind(this);
        this.setupDone = false;

    }

    getTxStatus = () => {
        // get the transaction states from the drizzle state
        const { transactionStack } = this.props.drizzleState;
        // get the transaction hash using our saved `stackId`
        const txHash = transactionStack[this.state.stackId];

        // if transaction hash does not exist, don't display anything
        if (!txHash) return null;

        // otherwise, return the transaction status
        return `Transaction status: ${this.props.drizzleState}`;
    }

    getCollaboratorsDropDown(collaborators) {
        let options = [{ key: -1, text: "None", value: "None" }]
        if (collaborators) {
            for (let index = 0; index < collaborators.value.length; index++) {
                options.push({ value: collaborators.value[index], text: collaborators.value[index], key: index });
            }
        }
        return options;
    }

    componentDidMount() {
        const { drizzle } = this.props;
        const contract = drizzle.contracts.ContractCollaborationManager;

        // let drizzle know we want to watch the `myString` method
        const dataKey = contract.methods.getCollaborators.cacheCall();

        //const collaborators = contract.methods["collaboratorAddressArray"].cacheCall();
        // save the `dataKey` to local component state for later reference
        this.setState({ dataKey });
        document.addEventListener("keydown", this.setupUseCase, false);

    }
    setupUseCase(evt) {

        if (this.setupDone || evt.keyCode !== 192) { return };
        this.setupDone = true;
        const contract = this.props.drizzle.contracts.ContractCollaborationManager;
        const drizzleState = this.props.drizzleState;
        console.log("Use case setting up");
        let supervisor = drizzleState.accounts[0];
        let customer = drizzleState.accounts[9];
        let taskType = 0;

        // await contract.methods.getGlobalIntegerPayloadCount().call();

        // Tasks for Process
        contract.methods.addCollaborator.cacheSend(drizzleState.accounts[0], "Lufthansa", {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.addCollaborator.cacheSend(drizzleState.accounts[9], "Customer Max", {
            from: this.props.defaultAccount,
            gas: 600000
        });

        contract.methods.createTask.cacheSend("board passengers", supervisor, taskType, [], {
            from: this.props.defaultAccount,
            gas: 600000
        });

        contract.methods.createTask.cacheSend("release fuel", supervisor, taskType, [0], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.createTask.cacheSend("get rid of passengers with incentive", supervisor, taskType, [0], {
            from: this.props.defaultAccount,
            gas: 600000
        });

        contract.methods.createTask.cacheSend("stop releasing fuel", supervisor, taskType, [1], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.createTask.cacheSend("stop sending out incentives", supervisor, taskType, [2], {
            from: this.props.defaultAccount,
            gas: 600000
        });

        contract.methods.createTask.cacheSend("extra safety check by engineer", supervisor, taskType, [0, 4], {
            from: this.props.defaultAccount,
            gas: 600000
        });

        contract.methods.createTask.cacheSend("safety check or nothing", supervisor, 2, [3, 5], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.createTask.cacheSend("ready for take-off", supervisor, taskType, [6], {
            from: this.props.defaultAccount,
            gas: 600000
        });

        // Payload
        contract.methods.createGlobalIntPayload.cacheSend(204, {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.createGlobalIntPayload.cacheSend(100, {
            from: this.props.defaultAccount,
            gas: 600000
        });


        // Decision 1,2,5
        contract.methods.addIntDecisionToTaskId.cacheSend(1, 0, 1, 0, [0, 200], [2, 5], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.addIntDecisionToTaskId.cacheSend(2, 0, 1, 1, [0, 200], [1, 5], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.addIntDecisionToTaskId.cacheSend(5, 1, 1, 2, [0, 200], [1, 2], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.addIntDecisionToTaskId.cacheSend(3, 1, 1, 0, [1, 80], [], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.addIntDecisionToTaskId.cacheSend(4, 1, 1, 2, [0, 200], [], {
            from: this.props.defaultAccount,
            gas: 600000
        });


        // ----  Task for Customer ----
        contract.methods.createTask.cacheSend("check in", customer, taskType, [], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.createTask.cacheSend("boarding", customer, taskType, [8], {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.createTask.cacheSend("take-off", customer, taskType, [9], {
            from: this.props.defaultAccount,
            gas: 600000
        });

    }

    render() {
        // get the contract state from drizzleState
        const { ContractCollaborationManager } = this.props.drizzleState.contracts;

        // using the saved `dataKey`, get the variable we're interested in
        const collaborators = ContractCollaborationManager.getCollaborators[this.state.dataKey];
        const collaboratorsOptions = this.getCollaboratorsDropDown(collaborators);

        return (
            <span>
                <Icon inverted color="black" name='group' size='large' /> Select Process Collaborators:{' '}
                <Dropdown inline options={collaboratorsOptions} defaultValue={collaboratorsOptions[0].value} onChange={(event, data) => {
                    this.props.onAccountChanged(data.value)

                }} />
            </span>
        );
    }
}

export default AccountSelectorComponent;