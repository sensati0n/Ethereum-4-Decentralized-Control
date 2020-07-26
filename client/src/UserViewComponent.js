import React from "react";
import { Step } from 'semantic-ui-react'
import Tasks from "./Tasks";

class UserViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            stackId: null,
            dataKey: null,
            taskToCompleteId: null,
            getTaskByIdDataKeys: null,
            getTasksDataKey: null,
            userAddress: null
        }
    }


    componentDidMount() {
        let address = this.props.drizzleState.accounts[9];
        this.setState({ userAddress: address })

        const contract = this.props.drizzle.contracts.ContractCollaborationManager;
        const getTasksDataKey = contract.methods.getTasks.cacheCall();
        const getTaskCountKey = contract.methods.getTaskCount.cacheCall();
        const ccmState = this.props.drizzleState.contracts.ContractCollaborationManager;

        let taskCount = ccmState.getTaskCount[getTaskCountKey];
        taskCount = (taskCount) ? Number(ccmState.getTaskCount[getTaskCountKey].value) : taskCount;
        const getTaskByIdDataKeys = [];

        for (let i = 0; i <= taskCount; i++) {
            getTaskByIdDataKeys.push(contract.methods.getTaskById.cacheCall(i));
        }
        this.setState({ getTasksDataKey, getTaskByIdDataKeys });
    }


    getTasks() {
        let unfullfilledtasks = []
        let tasks = Tasks.getAllTasks(this.props.drizzleState, this.state.getTaskByIdDataKeys, this.state.getTasksDataKey);
        for (let task in tasks) {
            if (tasks[task].resource === this.state.userAddress) {
                unfullfilledtasks.push(tasks[task]);
            }
        }
        return unfullfilledtasks;
    }
    getUserSteps(userTasks) {
        let stepsArray = []
        for (let userTask in userTasks) {
            stepsArray.push(<Step key={userTask} completed={userTasks[userTask].status} ordered={userTasks[userTask].status}>
                <Step.Content>
                    <Step.Title>{userTasks[userTask].description}</Step.Title>
                </Step.Content>
            </Step>)
        }
        return stepsArray;
    }

    render() {

        let steps = this.getUserSteps(this.getTasks())
        return (
            <Step.Group ordered>
                {steps}
            </Step.Group>
        )
    }

}

export default UserViewComponent;