import React from "react";
import { Dropdown } from 'semantic-ui-react'
import Tasks from "./Tasks";
class CompleteTaskComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            stackId: null,
            dataKey: null,
            taskToCompleteId: null,
            getTaskByIdDataKeys: null,
            getTasksDataKey: null,
        }

    }

    completeTask() {
        const { drizzle } = this.props;
        const contract = drizzle.contracts.ContractCollaborationManager;
        // let drizzle know we want to call the `set` method with `value`
        const stackId = contract.methods.setTaskOnCompleted.cacheSend(this.state.taskToCompleteId, {
            from: this.props.defaultAccount,
            gas: 600000
        });

        // save the `stackId` for later reference
        this.setState({ stackId });
    }

    getTasks() {
        let unfullfilledtasks = []
        let tasks = Tasks.getAllTasks(this.props.drizzleState, this.state.getTaskByIdDataKeys, this.state.getTasksDataKey);
        for (let task in tasks) {
            if (!tasks[task].status) {
                unfullfilledtasks.push({ key: task, text: task + ":\t" + tasks[task].description, value: task })
            }
        }
        return unfullfilledtasks;
    }

    componentDidMount() {
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

    render() {
        let options = this.getTasks();
        return (
            <div className="complete-task-input">
                <div className="collaborator-input">
                    <Dropdown placeholder='Task Id' onChange={
                        (event, data) => {
                            this.setState({ taskToCompleteId: data.value });
                        }
                    } fluid selection options={options} />
                </div>
                <button type="button" onClick={this.completeTask.bind(this)}>Complete Task</button>
            </div>
        );
    }
}

export default CompleteTaskComponent;