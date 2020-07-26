import React from "react";
import * as c from './Constants.js'
import "./CreateGlobalPayloadComponent.css"
import { Dropdown, Input, Popup } from 'semantic-ui-react'

class CreateGlobalPayloadComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            payloadValue: "",
            decisionType: "",
            newId: "",
        }
    }

    createPayload() {
        const { drizzle } = this.props;
        const contract = drizzle.contracts.ContractCollaborationManager;
        let value = this.state.payloadValue;

        if (value !== "") {
            switch (this.state.decisionType) {
                case 0:
                    this.createStringPayload(contract, String(value));
                    break;
                case 1:

                    if (!isNaN(value)) {
                        this.createIntPayload(contract, Number(value));
                    }
                    else {
                        console.error("Input is not numerical");
                    }
                    break;
                default:
            }
        }
    }

    createStringPayload(contract, value) {
        contract.methods.createGlobalStringPayload.cacheSend(value, {
            from: this.props.defaultAccount,
            gas: 600000
        });
        contract.methods.getGlobalStringPayloadCount().call().then((count) => {
            this.setState({ newId: count });
            this.resetInput();
        });
    }

    createIntPayload(contract, value) {
        contract.methods.createGlobalIntPayload.cacheSend(value, {
            from: this.props.defaultAccount,
            gas: 600000
        });

        contract.methods.getGlobalIntegerPayloadCount().call().then((count) => {
            this.setState({ newId: count });
            this.resetInput();
        });
    }

    resetInput() {
        this.setState({ payloadValue: "", decisionType: "" });
    }

    render() {
        return (
            <div className="payload-container">
                <div className="payload-type">
                    <Dropdown
                        placeholder='Select Type'
                        fluid selection
                        onChange={
                            (event, data) => {
                                this.setState({ decisionType: data.value });
                            }}
                        options={c.DECISIONOPTIONS} value={this.state.decisionType} />
                </div>
                <div className="payload">
                    <Input
                        icon='money bill alternate outline'
                        placeholder='Payload Value'
                        onChange={
                            (event, data) => {
                                this.setState({ payloadValue: data.value });
                            }}
                        value={this.state.payloadValue} />
                </div>

                <div className="payload-button">
                    <Popup
                        trigger={<button type="button"
                            onClick={this.createPayload.bind(this)}>Create Payload</button>}
                        content={<p>ID:{this.state.newId}</p>}
                        on='click'
                        position='right center'
                    />
                </div>
            </div >
        );
    }
}

export default CreateGlobalPayloadComponent;