import React from "react";
import "./CreateTaskComponent.css";
import { Dropdown, Input } from "semantic-ui-react";
import * as c from "./Constants.js";
class CreateTaskComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stackId: null,
      activity: "",
      address: "",
      taskType: "",
      requirements: [],
      dataKey: null,
      tasks: null,
      reqoptions: [],
      competitors: [],
    };
    this.taskTypes = c.TASKTYPES;

    this.handleRequirements = this.handleRequirements.bind(this);
    this.handleCreateTask = this.handleCreateTask.bind(this);
  }

  componentDidMount() {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.ContractCollaborationManager;
    const dataKey = contract.methods.getTasks.cacheCall();
    this.setState({ dataKey });
  }

  updateOptions(tasksObject) {
    const optionlist = [];
    if (tasksObject) {
      for (var i = 0; i < tasksObject.value.length; i++) {
        let option = {
          key: Number(tasksObject.value[i]),
          text: tasksObject.value[i],
          value: Number(tasksObject.value[i]),
        };
        optionlist.push(option);
      }
    }

    return optionlist;
  }
  handleRequirements(event, data) {
    this.setState({ requirements: data.value });
  }

  handleCreateTask = () => {
    if (
      this.state.activity === "" ||
      this.state.address === "" ||
      this.state.taskType === ""
    ) {
      console.error("Some required Fields are Empty! Cannot create Task!");
      return;
    }
    const { drizzle } = this.props;
    const contract = drizzle.contracts.ContractCollaborationManager;

    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods.createTask.cacheSend(
      this.state.activity,
      this.state.address,
      this.state.taskType,
      this.state.requirements,
      this.state.competitors,
      {
        from: this.props.defaultAccount,
        gas: 600000,
      }
    );
    // save the `stackId` for later reference
    this.setState({ stackId });
    this.resetForm();
  };

  resetForm() {
    this.setState({
      activity: "",
      address: "",
      taskType: "",
      requirements: [],
    });
  }

  getAccountsDropdownObject() {
    let accountOject = [];
    let drizzleAccounts = this.props.drizzleState.accounts;
    for (let acc in drizzleAccounts) {
      accountOject.push({
        key: drizzleAccounts[acc],
        text: acc + ":\t" + drizzleAccounts[acc],
        value: drizzleAccounts[acc],
      });
    }
    return accountOject;
  }

  render() {
    const { ContractCollaborationManager } = this.props.drizzleState.contracts;
    const tasksObject =
      ContractCollaborationManager.getTasks[this.state.dataKey];
    const newOptions = this.updateOptions(tasksObject);
    const accountOptions = this.getAccountsDropdownObject();
    return (
      <form className="add-task-form">
        <label className="add-task-label">
          <Input
            fluid
            icon="asl"
            placeholder="Activity"
            onChange={(event, data) => {
              this.setState({ activity: data.value });
            }}
            value={this.state.activity}
          />
        </label>
        <label className="add-task-label">
          <Dropdown
            placeholder="Responsible Account"
            onChange={(event, data) => {
              this.setState({ address: data.value });
            }}
            fluid
            selection
            options={accountOptions}
            value={this.state.address}
          />
        </label>
        <label className="add-task-label">
          <Dropdown
            placeholder="TaskType"
            onChange={(event, data) => {
              this.setState({ taskType: data.value });
            }}
            fluid
            selection
            options={this.taskTypes}
            value={this.state.taskType}
          />
        </label>
        <label className="add-task-label">
          <Dropdown
            placeholder="Requirements"
            onChange={(event, data) => {
              this.setState({ requirements: data.value });
            }}
            fluid
            multiple
            selection
            options={newOptions}
            value={this.state.requirements}
          />
        </label>
        <label className="add-task-label">
          <Dropdown
            placeholder="Competitors"
            onChange={(event, data) => {
              this.setState({ competitors: data.value });
            }}
            fluid
            multiple
            selection
            options={newOptions}
            value={this.state.competitors}
          />
        </label>
        <button type="button" onClick={this.handleCreateTask}>
          Create Task
        </button>
      </form>
    );
  }
}

export default CreateTaskComponent;
