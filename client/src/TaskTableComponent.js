import React from "react";
import { Table, Icon, Popup } from "semantic-ui-react";
import * as c from "./Constants.js";
import Tasks from "./Tasks";
import "./TaskTableComponent.css";

class TaskTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      getTasksDataKey: null,
      tasksData: [],
      getTaskByIdDataKeys: [],
      taskOptions: [],
      intPayloads: [],
      stringPayloads: [],
    };
    this.first = true;
  }

  getTaskEnumById(id) {
    let res;
    c.TASKTYPES.forEach((taskType) => {
      if (Number(taskType.value) === Number(id)) {
        res = taskType.text;
      }
    });
    return res;
  }

  getDecisionEnumById(id) {
    return c.DECISIONTYPES_INT[id];
  }

  getGatewayEnumById(id) {
    return c.GATEWAYTYPES_INT[id];
  }

  getOperatorEnumById(id) {
    return c.OPERATORTYPES_INT[id];
  }

  formatTaskIds(reqs) {
    let reqString = "";
    reqs.forEach((req) => {
      reqString += req + ", ";
    });
    return reqString.slice(0, reqString.length - 2);
  }

  formatCompetitors(comps) {
    let compString = "";
    if (comps.length !== 0) {
      comps.forEach((competitor) => {
        compString += competitor + ", ";
      });
      return compString.slice(0, compString.length - 2);
    } else {
      return "/";
    }
  }
  formatTaskStatus(status) {
    if (status) {
      return <Icon name="checkmark" />;
    }
    return <Icon name="attention" />;
  }

  getDecisionOptions(taskData) {
    return (
      <Popup
        key={taskData.id}
        trigger={
          <Table.Row negative={!taskData.status} positive={taskData.status}>
            <Table.Cell>{taskData.id}</Table.Cell>
            <Table.Cell>{taskData.description}</Table.Cell>
            <Table.Cell>{this.getTaskEnumById(taskData.tasktype)}</Table.Cell>
            <Table.Cell>{taskData.resource.substring(0, 9) + "..."}</Table.Cell>
            <Table.Cell>{this.formatTaskIds(taskData.requirements)}</Table.Cell>
            <Table.Cell>{this.formatTaskStatus(taskData.status)}</Table.Cell>
            <Table.Cell>{"true"}</Table.Cell>
            <Table.Cell>
              {this.formatCompetitors(taskData.competitors)}
            </Table.Cell>
          </Table.Row>
        }
      >
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Decision Type</Table.HeaderCell>
              <Table.HeaderCell>Task Completed</Table.HeaderCell>
              <Table.HeaderCell>Gateway Type</Table.HeaderCell>
              <Table.HeaderCell>Global Payload</Table.HeaderCell>
              <Table.HeaderCell>Operator</Table.HeaderCell>
              <Table.HeaderCell>Local Value</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                {this.getDecisionEnumById(taskData.decisionType)}
              </Table.Cell>

              <Table.Cell>
                {taskData.decisionCompleted ? "true" : "false"}
              </Table.Cell>
              <Table.Cell>
                {this.getGatewayEnumById(taskData.gatewayType)}
              </Table.Cell>
              {Number(taskData.decisionType) === 0 && (
                <Table.Cell>
                  {this.state.stringPayloads[Number(taskData.operands.global)]}
                </Table.Cell>
              )}
              {Number(taskData.decisionType) === 1 && (
                <Table.Cell>
                  {this.state.intPayloads[Number(taskData.operands.global)]}
                </Table.Cell>
              )}
              <Table.Cell>
                {this.getOperatorEnumById(taskData.operator)}
              </Table.Cell>
              <Table.Cell>{taskData.operands.local}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Popup>
    );
  }

  getOptions(taskData) {
    if (taskData.decisionType) {
      return this.getDecisionOptions(taskData);
    } else {
      return (
        <Table.Row
          key={taskData.id}
          negative={!taskData.status}
          positive={taskData.status}
        >
          <Table.Cell>{taskData.id}</Table.Cell>
          <Table.Cell>{taskData.description}</Table.Cell>
          <Table.Cell>{this.getTaskEnumById(taskData.tasktype)}</Table.Cell>
          <Table.Cell>{taskData.resource.substring(0, 9) + "..."}</Table.Cell>
          <Table.Cell> {this.formatTaskIds(taskData.requirements)}</Table.Cell>
          <Table.Cell>{this.formatTaskStatus(taskData.status)}</Table.Cell>
          <Table.Cell>{"false"}</Table.Cell>
          <Table.Cell>
            {this.formatCompetitors(taskData.competitors)}
          </Table.Cell>
        </Table.Row>
      );
    }
  }

  sortTaskData(options) {
    //options = options.sort(this.compareTaskKeys);
    options = options.sort(function (a, b) {
      let keyA = parseInt(a["key"]);
      let keyB = parseInt(b["key"]);
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    return options;
  }

  taskDataCallback(index, taskData) {
    let options = this.state.taskOptions;
    options.push(this.getOptions(taskData));
    options = this.sortTaskData(options);
    this.setState({ taskOptions: options });
  }

  async createTableContentPromise() {
    await this.setGlobalPayloadValues();
    const contract = this.props.drizzle.contracts.ContractCollaborationManager;
    Tasks.getAllTasksWithDecisionPromise(
      contract,
      this.taskDataCallback.bind(this)
    );
  }

  async setGlobalPayloadValues() {
    const contract = this.props.drizzle.contracts.ContractCollaborationManager;
    let intPayloads = [];
    let stringPayloads = [];

    let intPayloadCount = await contract.methods
      .getGlobalIntegerPayloadCount()
      .call();
    let stringPayloadCount = await contract.methods
      .getGlobalStringPayloadCount()
      .call();

    for (let i = 0; i < intPayloadCount; i++) {
      intPayloads.push(
        await contract.methods.getGlobalIntPayloadValueById(i).call()
      );
    }
    for (let i = 0; i < stringPayloadCount; i++) {
      stringPayloads.push(
        await contract.methods.getGlobalStringPayloadValueById(i).call()
      );
    }
    this.setState({ intPayloads, stringPayloads });
  }

  componentDidMount() {
    this.createTableContentPromise();
  }

  render() {
    return (
      <div className="task-table">
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Task Id</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
              <Table.HeaderCell>Requirements</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>has Decision</Table.HeaderCell>
              <Table.HeaderCell>Competitors</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{this.state.taskOptions}</Table.Body>
        </Table>
      </div>
    );
  }
}

export default TaskTableComponent;
