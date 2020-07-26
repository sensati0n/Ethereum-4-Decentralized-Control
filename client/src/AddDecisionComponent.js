import React from "react";
import * as c from "./Constants.js";
import { Dropdown, Button, Input, Divider, Header } from "semantic-ui-react";
import Tasks from "./Tasks";

class AddDecisionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTask: null,
      getTasksDataKey: "",
      getTaskByIdDataKeys: "",
      getPayloadsDataKey: "",
      getIntPayloadCountKey: "",
      getStringPayloadCountKey: "",
      intPayloadOptions: [],
      stringPayloadOptions: [],
      isIntDecision: true,
      isExclusive: false,
      localOperand: "",
    };
  }

  componentDidMount() {
    const contract = this.props.drizzle.contracts.ContractCollaborationManager;
    const getTasksDataKey = contract.methods.getTasks.cacheCall();
    const intPayloadCountKey = contract.methods.getGlobalIntegerPayloadCount.cacheCall();

    const getTaskCountKey = contract.methods.getTaskCount.cacheCall();
    const ccmState = this.props.drizzleState.contracts
      .ContractCollaborationManager;

    let taskCount = ccmState.getTaskCount[getTaskCountKey];
    taskCount = taskCount ? Number(taskCount.value) : 150;
    const getTaskByIdDataKeys = [];

    for (let i = 0; i <= taskCount; i++) {
      getTaskByIdDataKeys.push(contract.methods.getTaskById.cacheCall(i));
    }
    this.setIntegerPayloadOptions(contract, ccmState);
    this.setStringPayloadOptions(contract, ccmState);
    this.setState({
      getTasksDataKey,
      getTaskByIdDataKeys,
      intPayloadCountKey,
    });
  }

  setIntegerPayloadOptions(contract, ccmState) {
    contract.methods
      .getGlobalIntegerPayloadCount()
      .call()
      .then((count) => {
        let intPayloadOptions = [];

        for (let i = 0; i < count; i++) {
          let key = contract.methods.getGlobalIntPayloadValueById.cacheCall(i);

          let payload = ccmState.getGlobalIntPayloadValueById[key];
          if (payload) {
            intPayloadOptions.push({
              key: i,
              value: i,
              text: `ID: ${i} | Payload: ${payload.value}`,
            });
          }
        }
        this.setState({ intPayloadOptions });
      });
  }

  setStringPayloadOptions(contract, ccmState) {
    contract.methods
      .getGlobalStringPayloadCount()
      .call()
      .then((count) => {
        let stringPayloadOptions = [];
        this.setState({ stringPayloadOptions });

        for (let i = 0; i < count; i++) {
          let key = contract.methods.getGlobalStringPayloadValueById.cacheCall(
            i
          );
          let payload = ccmState.getGlobalStringPayloadValueById[key];
          if (payload) {
            stringPayloadOptions.push({
              key: i,
              value: i,
              text: `ID: ${i} | Payload: ${payload.value}`,
            });
          }
        }
        this.setState({ stringPayloadOptions });
      });
  }

  getTaskDropdownOptions() {
    let tasks = Tasks.getAllTasks(
      this.props.drizzleState,
      this.state.getTaskByIdDataKeys,
      this.state.getTasksDataKey
    );
    let options = [];

    tasks.forEach((task) => {
      options.push({
        key: task.id,
        value: task.id,
        text: `Task: ${task.id} | Description: ${task.description}`,
      });
    });
    return options;
  }

  clearInput() {
    this.setState({
      selectedIntPayload: "",
      selectedStringPayload: "",
      selectedOperator: "",
      selectedTask: "",
      localOperand: "",
    });
  }

  addDecision() {
    try {
      const contract = this.props.drizzle.contracts
        .ContractCollaborationManager;
      let gatewayType = this.state.isExclusive
        ? c.GATEWAYTYPES.DBEXCL
        : c.GATEWAYTYPES.DBINCL;
      let operator = this.state.selectedOperator;

      if (this.state.isIntDecision) {
        this.addIntDecision(contract, gatewayType, operator);
      } else {
        this.addStringDecision(contract, gatewayType, operator);
      }
      this.clearInput();
    } catch (e) {
      console.error("Error while adding Decision, ", e);
    }
  }

  addIntDecision(contract, gatewayType, operator) {
    let id = this.state.selectedTask;
    let decisionType = c.DECISIONTYPES.INTDESC;
    let operands = [
      this.state.selectedIntPayload,
      Number(this.state.localOperand),
    ];

    contract.methods.addIntDecisionToTaskId.cacheSend(
      id,
      gatewayType,
      decisionType,
      operator,
      operands,
      {
        from: this.props.defaultAccount,
        gas: 600000,
      }
    );
  }

  addStringDecision(contract, gatewayType, operator) {
    let id = this.state.selectedTask;
    let decisionType = c.DECISIONTYPES.STRDESC;
    let operands = [this.state.selectedStringPayload, this.state.localOperand];

    contract.methods.addStringDecisionToTaskId.cacheSend(
      id,
      gatewayType,
      decisionType,
      operator,
      operands,
      {
        from: this.props.defaultAccount,
        gas: 600000,
      }
    );
  }

  renderButtonGroup() {
    return (
      <label>
        <Button.Group>
          <Button
            type="button"
            color={this.state.isIntDecision ? "blue" : null}
            onClick={() => {
              this.setState({ isIntDecision: true });
            }}
          >
            Int
          </Button>
          <Button.Or />
          <Button
            type="button"
            color={!this.state.isIntDecision ? "blue" : null}
            onClick={(a, b) => {
              this.setState({ isIntDecision: false });
            }}
          >
            String
          </Button>
        </Button.Group>
      </label>
    );
  }

  renderDecisionCore() {
    return (
      <div className="decision-global-op-local">
        <div className="decision-global-op-local-inner">
          {this.renderButtonGroup()}

          {this.state.isIntDecision && (
            <label className="select-payload-label">
              <Dropdown
                placeholder="Select Global Integer Payload"
                onChange={(event, data) => {
                  this.setState({ selectedIntPayload: data.value });
                }}
                floating
                selection
                options={this.state.intPayloadOptions}
                value={this.state.selectedIntPayload}
              />
            </label>
          )}

          {!this.state.isIntDecision && (
            <label className="select-payload-label">
              <Dropdown
                placeholder="Select Global String Payload"
                onChange={(event, data) => {
                  this.setState({ selectedStringPayload: data.value });
                }}
                floating
                selection
                options={this.state.stringPayloadOptions}
                value={this.state.selectedStringPayload}
              />
            </label>
          )}

          <label className="select-operator-label">
            <Dropdown
              placeholder="Operator"
              onChange={(event, data) => {
                this.setState({ selectedOperator: data.value });
              }}
              compact
              floating
              selection
              options={c.OPERATOROPTIONS}
              value={this.state.selectedOperator}
            />
          </label>

          <label className="select-operand-label">
            <Input
              placeholder="Local Value"
              onChange={(event, data) => {
                this.setState({ localOperand: data.value });
              }}
              value={this.state.localOperand}
            />
          </label>
        </div>
      </div>
    );
  }

  render() {
    let tasksObject = this.getTaskDropdownOptions();
    return (
      <form className="add-decision-form">
        <div className="divider">
          <Divider horizontal>
            <Header as="h4">Task</Header>
          </Divider>
        </div>
        <label className="select-task-label">
          <Dropdown
            placeholder="Select Task"
            onChange={(event, data) => {
              this.setState({ selectedTask: data.value });
            }}
            fluid
            selection
            options={tasksObject}
            value={this.state.selectedTask}
          />
        </label>

        <div className="divider">
          <Divider horizontal>
            <Header as="h4">Decision Values</Header>
          </Divider>
        </div>
        {this.renderDecisionCore()}

        <label>
          <button type="button" onClick={this.addDecision.bind(this)}>
            Add Decision
          </button>
        </label>
      </form>
    );
  }
}

export default AddDecisionComponent;
