import React from "react";
import { Dropdown, Button, Input, Message } from "semantic-ui-react";

class ChangeGlobalPayloadComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      intPayloadOptions: [],
      stringPayloadOptions: [],
      isIntPayload: true,
      newPayload: "",
      visible: false,
    };
  }

  componentDidMount() {
    const contract = this.props.drizzle.contracts.ContractCollaborationManager;
    const ccmState = this.props.drizzleState.contracts
      .ContractCollaborationManager;

    this.setIntegerPayloadOptions(contract, ccmState);
    this.setStringPayloadOptions(contract, ccmState);
  }

  handleDismiss = () => {
    this.setState({ visible: false });

    setTimeout(() => {
      this.setState({ visible: false });
    }, 2000);
  };

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

  changePayload() {
    const contract = this.props.drizzle.contracts.ContractCollaborationManager;

    if (this.state.isIntPayload) {
      this.changeIntPayload(contract);
    } else {
      this.changeStringPayload(contract);
    }
    this.resetInput();
  }

  changeIntPayload(contract) {
    let payloadID = this.state.selectedIntPayload;

    if (!isNaN(this.state.newPayload)) {
      let newPayload = Number(this.state.newPayload);
      contract.methods.changeGlobalIntPayload.cacheSend(payloadID, newPayload, {
        from: this.props.defaultAccount,
        gas: 600000,
      });
    } else {
      console.error("New Payload Value must be Numerical!");
      this.setState({ visible: true });
      setTimeout(() => {
        this.setState({ visible: false });
      }, 8000);
    }
  }

  changeStringPayload(contract) {
    let newPayload = this.state.newPayload;
    let payloadID = this.state.selectedStringPayload;
    console.log(newPayload, payloadID);
    contract.methods.changeGlobalStringPayload.cacheSend(
      payloadID,
      newPayload,
      {
        from: this.props.defaultAccount,
        gas: 600000,
      }
    );
  }

  resetInput() {
    this.setState({
      selectedIntPayload: "",
      selectedStringPayload: "",
      newPayload: "",
    });
  }

  renderButtonGroup() {
    return (
      <label className="change-payload-item">
        <Button.Group>
          <Button
            type="button"
            color={this.state.isIntPayload ? "blue" : null}
            onClick={() => {
              this.setState({ isIntPayload: true });
            }}
          >
            Int
          </Button>
          <Button.Or />
          <Button
            type="button"
            color={!this.state.isIntPayload ? "blue" : null}
            onClick={(a, b) => {
              this.setState({ isIntPayload: false });
            }}
          >
            String
          </Button>
        </Button.Group>
      </label>
    );
  }

  render() {
    return (
      <div className="change-payload-container">
        {this.state.visible && (
          <Message
            onDismiss={this.handleDismiss.bind(this)}
            header="Error"
            content="Input must be numerical"
            negative
          />
        )}
        {this.renderButtonGroup()}
        {this.state.isIntPayload && (
          <Dropdown
            className="change-payload-item"
            placeholder="Select Global Integer Payload"
            onChange={(event, data) => {
              this.setState({ selectedIntPayload: data.value });
            }}
            floating
            selection
            options={this.state.intPayloadOptions}
            value={this.state.selectedIntPayload}
          />
        )}

        {!this.state.isIntPayload && (
          <Dropdown
            className="change-payload-item"
            placeholder="Select Global String Payload"
            onChange={(event, data) => {
              this.setState({ selectedStringPayload: data.value });
            }}
            floating
            selection
            options={this.state.stringPayloadOptions}
            value={this.state.selectedStringPayload}
          />
        )}

        <Input
          className="change-payload-item"
          placeholder="New Payload"
          onChange={(event, data) => {
            this.setState({ newPayload: data.value });
          }}
          value={this.state.newPayload}
        />

        <div>
          <button
            className="change-payload-item"
            type="button"
            onClick={this.changePayload.bind(this)}
          >
            Change Payload
          </button>
        </div>
      </div>
    );
  }
}
export default ChangeGlobalPayloadComponent;
