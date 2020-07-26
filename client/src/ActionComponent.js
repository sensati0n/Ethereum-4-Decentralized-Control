import React from "react";
import { Dropdown, Input } from 'semantic-ui-react'
import Tasks from "./Tasks"


class ActionComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTask: null,
            getTasksDataKey: "",
            getTaskByIdDataKeys: "",
            payValue: 0,
            receiver: ""
        }
    }

    componentDidMount() {
        const contract = this.props.drizzle.contracts.ContractCollaborationManager;
        const getTasksDataKey = contract.methods.getTasks.cacheCall();

        const getTaskCountKey = contract.methods.getTaskCount.cacheCall();
        const ccmState = this.props.drizzleState.contracts.ContractCollaborationManager;

        let taskCount = ccmState.getTaskCount[getTaskCountKey];
        taskCount = (taskCount) ? Number(taskCount.value) : 150;
        const getTaskByIdDataKeys = [];

        for (let i = 0; i <= taskCount; i++) {
            getTaskByIdDataKeys.push(contract.methods.getTaskById.cacheCall(i));
        }

        this.setState({
            getTasksDataKey,
            getTaskByIdDataKeys,

        });
    }

    getAccountsDropdownObject() {
        let accountOject = [];
        let drizzleAccounts = this.props.drizzleState.accounts;
        for (let acc in drizzleAccounts) {
            accountOject.push({ key: drizzleAccounts[acc], text: acc + ":\t" + drizzleAccounts[acc], value: drizzleAccounts[acc] })
        }
        return accountOject;
    }

    getTaskDropdownOptions() {
        let tasks = Tasks.getAllTasks(this.props.drizzleState, this.state.getTaskByIdDataKeys, this.state.getTasksDataKey);
        let options = [];

        tasks.forEach(task => {
            options.push({ key: task.id, value: task.id, text: `Task: ${task.id} | Description: ${task.description}` });
        });
        return options;
    }

    clearInput() {
        this.setState({
            selectedTask: "",
            receiver: "",
            payValue: ""
        });
    }

    addAction() {
        const contract = this.props.drizzle.contracts.ContractCollaborationManager;
        console.log("sending ", this.state.payValue, "to", this.state.receiver);

        contract.methods.addActionToTaskId.cacheSend(this.state.selectedTask, this.state.payValue, this.state.receiver, {
            from: this.props.defaultAccount,
            gas: 600000
        });
        this.clearInput();
    }

    render() {
        let tasksObject = this.getTaskDropdownOptions();
        let accOptions = this.getAccountsDropdownObject();
        return (
            <form className="add-decision-form" >

                <label className="select-task">
                    <Dropdown placeholder='Select Task' onChange={
                        (event, data) => {
                            this.setState({ selectedTask: data.value });
                        }
                    } fluid selection options={tasksObject} value={this.state.selectedTask} />
                </label>

                <label className="select-task">
                    <Input placeholder='Ethereum' onChange={
                        (event, data) => {
                            this.setState({ payValue: data.value });
                        }} value={this.state.payValue} />
                </label>
                <label className="select-task">
                    <Dropdown placeholder='Select Receiver Account' onChange={
                        (event, data) => {
                            this.setState({ receiver: data.value });
                        }
                    } fluid selection options={accOptions} value={this.state.receiver} />
                </label>
                <label >
                    <button type="button" onClick={this.addAction.bind(this)}>Add Action</button>
                </label>
            </form >
        );
    }
}

export default ActionComponent;