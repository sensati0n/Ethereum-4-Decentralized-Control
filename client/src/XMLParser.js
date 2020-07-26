import React, { Component, useState, useRef } from "react";
import BpmnModdle from "bpmn-moddle";
//import SetTask from "./SetTask";

const XMLParser = (props) => {
  const [taskId, setTaskId] = useState(null);
  const [integerDecisionId, setIntegerDecisionId] = useState(null);
  const [stringDecisionId, setStringDecisionId] = useState(null);
  const [createGlobalIntegerPayload, setcreateGlobalIntegerPayload] = useState(
    null
  );
  const [createGlobalStringPayload, setcreateGlobalStringPayload] = useState(
    null
  );
  const { drizzle, drizzleState } = props;
  const [uploadedFile, setUploadedFile] = useState(null);
  const tasksForContract = {};
  const tasksObject = {};
  let idCount = 0;

  const globalIntegerPayloadMap = new Map();
  const globalStringPayloadMap = new Map();

  const taskTypeEnum = {
    TASK: 0,
    AND: 1,
    OR: 2,
    XOR: 3,
  };

  // aus "[(0-9)^+]" ne Liste "i is in [0-3000]"
  const createListFromString = (elementstring) => {
    let localvaluelist = [];
    let startElement = elementstring.split("-")[0].slice(1);
    let endElement = elementstring.split("-")[1].slice(1);
    let i = parseInt(startElement, 10);
    for (i; i < endElement; i++) {
      localvaluelist.push(i);
    }
    return localvaluelist;
  };

  //aus "[0,1,2,3]" [0-3], [0,1,2,3]
  const createSingleElementListFromString = (elementstring) => {
    let localvaluelist = [];
    //cutting "[" and "]" and splitting by ","
    elementstring = elementstring.slice(0).slice(elementstring.length);
    let elementlist = elementstring.split(",");
    elementlist.forEach((number) => {
      localvaluelist.push(number);
    });
    return localvaluelist;
  };

  const createIsElementList = (elementstring) => {
    const stringRangeElementExp = RegExp("[[0-9]-[0-9]*]");
    const stringisElementExp = RegExp(
      "([0-9][0-9]*)|([0-9][0-9]*)-([0-9][0-9]*)"
    );
    if (stringRangeElementExp.test(elementstring)) {
      return createListFromString(elementstring);
    } else if (stringisElementExp.test(elementstring)) {
      return createSingleElementListFromString(elementstring);
    } else return [];
  };

  //wir evaluieren den localvalue und schauen ob es durch isNaN ein zahl ist oder nicht
  const parseDecisionType = (dtype) => {
    console.log("Entscheidung : " + dtype + " isNaN " + isNaN(dtype));
    if (isNaN(dtype)) {
      return 0;
    } else {
      return 1;
    }
  };

  //contract code: enum Operator{LESS,GREATER,EQUAL,NEQ,LEQ,GEQ}
  const parseIntegerOperator = (integerOperator) => {
    switch (integerOperator) {
      case "<":
        return 0;
      case ">":
        return 1;
      case "=":
        return 2;
      case "!=":
        return 3;
      case "<=":
        return 4;
      case ">=":
        return 5;
      case "in":
        return 6;
    }
  };
  const parseStringOperator = (stringOperator) => {
    switch (stringOperator) {
      case "=":
        return 2;
      case "!=":
        return 3;
      default:
        console.log(
          stringOperator +
          " operator not allowed for String decision, = was choosen"
        );
        return 2;
    }
  };

  const checkIfPayloadNameExists = (payloadname, payloadtype) => {
    if (payloadtype === "integer") {
      if (globalIntegerPayloadMap.get(payloadname) !== undefined) {
        console.log("Integer Payload " + payloadname + " exists already ");
        return true;
      } else return false;
    }
    if (payloadtype === "string") {
      if (globalStringPayloadMap.get(payloadname) !== undefined) {
        console.log("String Payload " + payloadname + " exists already ");
        return true;
      } else return false;
    }
  };

  //bekommt "name", dieser ist der variablen name, mappt den zu bekannt oder erstellt neu
  const createIdForGlobalPayload = (payloadname, payloadtype) => {
    //console.log(payloadname, payloadtype);
    if (payloadtype === 0) {
      payloadtype = "string";
    }
    if (payloadtype === 1) {
      payloadtype = "integer";
    }
    let payloadid;
    console.log(
      "Check if payloadname exists: " +
      checkIfPayloadNameExists(payloadname, payloadtype)
    );
    if (checkIfPayloadNameExists(payloadname, payloadtype)) {
      if (payloadtype === "integer") {
        payloadid = globalIntegerPayloadMap.get(payloadname);
        return payloadid;
      }
      if (payloadtype === "string") {
        payloadid = globalStringPayloadMap.get(payloadname);
        return payloadid;
      }
    } else {
      if (payloadtype === "integer") {
        payloadid = globalIntegerPayloadMap.size;
        console.log(
          "Creating Global Int Payload " + payloadname + " id: " + payloadid
        );
        globalIntegerPayloadMap.set(payloadname, payloadid);
        return payloadid;
      }
      if (payloadtype === "string") {
        payloadid = globalStringPayloadMap.size;
        console.log(
          "Creating Global String Payload " + payloadname + " id: " + payloadid
        );
        globalStringPayloadMap.set(payloadname, payloadid);
        return payloadid;
      }
    }
  };

  //creates them with default 0 and empty as value default
  const createGlobalPayloads = () => {
    const contract = drizzle.contracts.ContractCollaborationManager;
    let intvalue = 0;
    let stringvalue = " ";
    console.log(globalIntegerPayloadMap.size);
    console.log(globalStringPayloadMap.size);
    for (let i = 0; i < globalIntegerPayloadMap.size; i++) {
      const createGlobalIntegerPayload = contract.methods[
        "createGlobalIntPayload"
      ].cacheSend(intvalue, {
        from: props.defaultAccount,
        gas: 1000000,
      });
      setcreateGlobalIntegerPayload(createGlobalIntegerPayload);
    }
    for (let i = 0; i < globalStringPayloadMap.size; i++) {
      const createGlobalStringPayload = contract.methods[
        "createGlobalStringPayload"
      ].cacheSend(stringvalue, {
        from: props.defaultAccount,
        gas: 1000000,
      });
      setcreateGlobalStringPayload(createGlobalStringPayload);
    }
    console.log("global payloads created");
  };

  // "[name] [operator] [localvalue]"
  const parseDecision = (decisionstring, gatewaytype) => {
    console.log("parseDecision(): " + decisionstring);
    let decisiontype = decisionstring.split(/[ ,]+/)[2];
    let decision = {};
    decision.gatewaytype = gatewaytype;
    decision.decisiontype = parseDecisionType(decisiontype);
    decision.idToGlobalPayload = createIdForGlobalPayload(
      decisionstring.split(/[ ,]+/)[0],
      decision.decisiontype
    );
    decision.operator = parseIntegerOperator(decisionstring.split(/[ ,]+/)[1]);

    if (decision.decisiontype === 1) {
      if (decision.operator === 6) {
        decision.localvalue = decisionstring.split(/[ ,]+/)
        decision.localvalue.shift()
        decision.localvalue.shift()
        console.log(decision.localvalue)
      }
      else {
        decision.localvalue = [parseInt(decisionstring.split(/[ ,]+/)[2])];
      }

    } else {
      decision.localvalue = decisionstring.split(/[ ,]+/)[2];
    }
    //console.log(decision);
    return decision;
  };

  const addTasksToJson = (taskelement) => {
    let task = {};
    //console.log("adding " + taskelement.resource);
    if (taskelement.name == undefined) task.name = "DefaultValue";
    task.resource = taskelement.resource;
    task.type = taskelement.$type;
    task.id = idCount;
    task.name = taskelement.name;
    task.requirements = [];
    tasksObject[taskelement.id] = task;
    task.competitor = [];
    //console.log(tasksObject);
    idCount++;
  };

  const handleUpload = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let file = uploadedFile;
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = (evt) => {
        const readerData = evt.target.result;
        var moddle = new BpmnModdle();
        moddle.fromXML(readerData, function (err, definitions) {
          if (definitions["rootElements"]) {
            definitions["rootElements"].forEach((process) => {
              if (process["laneSets"]) {
                process["laneSets"].forEach((laneset) => {
                  laneset["lanes"].forEach((lane) => {
                    if (lane["flowNodeRef"]) {
                      lane["flowNodeRef"].forEach((e) => {
                        if (e.$type === "bpmn:StartEvent") {
                          e.resource = lane.name;
                          addTasksToJson(e);
                        }
                      });
                      lane["flowNodeRef"].forEach((e) => {
                        if (e.$type === "bpmn:Task") {
                          e.resource = lane.name;
                          addTasksToJson(e);
                        }
                      });
                      lane["flowNodeRef"].forEach((e) => {
                        if (e.$type === "bpmn:EndEvent") {
                          e.resource = lane.name;
                          addTasksToJson(e);
                        }
                      });
                    }
                  });
                });
              }
              if (process["flowElements"]) {
                process["flowElements"].forEach((e) => {
                  if (e.$type !== "bpmn:SequenceFlow") {
                    //wenn e kein seqflow dann betrachte ich incoming elemente
                    if (e.incoming) {
                      e.incoming.forEach((incoming) => {
                        if (incoming.$type === "bpmn:SequenceFlow") {
                          //console.log(incoming);
                          let bpmnType = incoming.sourceRef.$type;
                          if (
                            bpmnType === "bpmn:StartEvent" ||
                            bpmnType === "bpmn:Task" ||
                            bpmnType === "bpmn:EndEvent"
                          ) {
                            if (tasksObject[e.id]) {
                              tasksObject[e.id].requirements.push(
                                tasksObject[incoming.sourceRef.id].id
                              );
                            }
                          }
                          if (bpmnType === "bpmn:ExclusiveGateway") {
                            incoming.sourceRef.incoming.forEach(
                              (exclusive_incoming) => {
                                if (tasksObject[e.id]) {
                                  tasksObject[e.id].requirements.push(
                                    tasksObject[exclusive_incoming.sourceRef.id]
                                      .id
                                  );
                                  tasksObject[e.id].type =
                                    "bpmn:ExclusiveGateway";
                                }
                              }
                            );
                          }
                          if (bpmnType === "bpmn:ParallelGateway") {
                            incoming.sourceRef.incoming.forEach(
                              (parallel_incoming) => {
                                if (tasksObject[e.id]) {
                                  tasksObject[e.id].requirements.push(
                                    tasksObject[parallel_incoming.sourceRef.id]
                                      .id
                                  );
                                  tasksObject[e.id].type = bpmnType;
                                }
                              }
                            );
                          }
                          if (bpmnType === "bpmn:InclusiveGateway") {
                            incoming.sourceRef.incoming.forEach(
                              (inclusive_incoming) => {
                                if (tasksObject[e.id]) {
                                  tasksObject[e.id].requirements.push(
                                    tasksObject[inclusive_incoming.sourceRef.id]
                                      .id
                                  );
                                  tasksObject[e.id].type = bpmnType;
                                }
                              }
                            );
                          }
                        }
                      });
                    }
                    //handle competitors and Decisions
                    if (e.$type === "bpmn:ExclusiveGateway") {
                      if (e.outgoing) {
                        //competitor sollten hier ausgehende Seqflows sein
                        e.outgoing.forEach((competitor) => {
                          e.outgoing.forEach((value) => {
                            if (
                              value.targetRef.id !== competitor.targetRef.id
                            ) {
                              tasksObject[
                                competitor.targetRef.id
                              ].competitor.push(
                                tasksObject[value.targetRef.id].id
                              );
                            }
                          });
                          if (competitor.name) {
                            // Hier 0 wegen exlusiveGateway
                            tasksObject[
                              competitor.targetRef.id
                            ].decision = parseDecision(competitor.name, 0);
                          }
                        });
                      }
                    }
                    if (e.$type === "bpmn:InclusiveGateway") {
                      if (e.outgoing) {
                        //competitor sollten hier ausgehende Seqflows sein
                        e.outgoing.forEach((competitor) => {
                          e.outgoing.forEach((value) => {
                            if (
                              value.targetRef.id !== competitor.targetRef.id
                            ) {
                              tasksObject[
                                competitor.targetRef.id
                              ].competitor.push(
                                tasksObject[value.targetRef.id].id
                              );
                            }
                          });
                          if (competitor.name) {
                            // Hier 0 wegen exlusiveGateway
                            tasksObject[
                              competitor.targetRef.id
                            ].decision = parseDecision(competitor.name, 1);
                          }
                        });
                      }
                    }
                  }
                });
                for (let x = 0; x < Object.keys(tasksObject).length; x++) {
                  for (var e in tasksObject) {
                    if (x === tasksObject[e].id) {
                      tasksForContract[x] = tasksObject[e];
                    }
                  }
                }
                console.log("BPMN Model parsed");
                //we need to remove the exclusive tag after opening exlusive
                for (var i in tasksForContract) {
                  if (
                    tasksForContract[i].type === "bpmn:ExclusiveGateway" &&
                    tasksForContract[i].requirements.length == 1
                  ) {
                    tasksForContract[i].type = "bpmn:Task";
                  }
                }
              }
            });
          }
        });
      };
    } else {
      console.log("NO Document provided");
    }
  };

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[taskId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    return `Transaction status: ${
      transactions[txHash] && transactions[txHash].status
      }`;
  };

  const setValue = (
    taskName,
    taskResource,
    taskType,
    taskRequirements = [],
    taskCompetitors = []
  ) => {
    const contract = drizzle.contracts.ContractCollaborationManager;
    const taskId = contract.methods["createTask"].cacheSend(
      taskName,
      taskResource,
      taskType,
      taskRequirements,
      taskCompetitors,
      {
        from: props.defaultAccount,
        gas: 1000000,
      }
    );
    // save the `stackId` for later reference
    setTaskId(taskId);
  };

  const setStringDecision = (
    taskId,
    gatewayType,
    decisionType,
    decisionOperator,
    decisionOperants
  ) => {
    console.log(
      "adding stringdecision for task ",
      taskId,
      " with ",
      decisionOperants,
      decisionType,
      decisionOperator
    );
    const contract = drizzle.contracts.ContractCollaborationManager;
    const stringDecisionId = contract.methods[
      "addStringDecisionToTaskId"
    ].cacheSend(
      taskId,
      gatewayType,
      decisionType,
      decisionOperator,
      decisionOperants,
      {
        from: props.defaultAccount,
        gas: 1000000,
      }
    );
    setStringDecisionId(stringDecisionId);
  };

  const setIntegerDecision = (
    taskId,
    gatewayType,
    decisionType,
    decisionOperator,
    decisionOperants
  ) => {
    console.log("adding intdecision for ", taskId, " with ", decisionOperants);
    const contract = drizzle.contracts.ContractCollaborationManager;
    const integerDecisionId = contract.methods[
      "addIntDecisionToTaskId"
    ].cacheSend(
      taskId,
      gatewayType,
      decisionType,
      decisionOperator,
      decisionOperants,
      {
        from: props.defaultAccount,
        gas: 1000000,
      }
    );
    setIntegerDecisionId(integerDecisionId);
  };

  const setDecision = (
    taskId,
    gatewayType,
    decisionType,
    decisionOperator,
    decisionOperants
  ) => {
    if (decisionType === 0) {
      setStringDecision(
        taskId,
        gatewayType,
        decisionType,
        decisionOperator,
        decisionOperants
      );
    }
    if (decisionType === 1) {
      setIntegerDecision(
        taskId,
        gatewayType,
        decisionType,
        decisionOperator,
        decisionOperants
      );
    }
  };

  const handleTaskType = (tasktype) => {
    switch (tasktype) {
      case "bpmn:StartEvent":
        return taskTypeEnum.TASK;
      case "bpmn:Task":
        return taskTypeEnum.TASK;
      case "bpmn:EndEvent":
        return taskTypeEnum.TASK;
      case "bpmn:ExclusiveGateway":
        return taskTypeEnum.XOR;
      case "bpmn:ParallelGateway":
        return taskTypeEnum.AND;
      case "bpmn:InclusiveGateway":
        return taskTypeEnum.OR;
    }
  };

  const createCCM = (input) => {
    input.preventDefault();
    //console.log(tasksForContract);
    for (var tasks in tasksForContract) {
      setValue(
        tasksForContract[tasks].name,
        tasksForContract[tasks].resource,
        handleTaskType(tasksForContract[tasks].type),
        tasksForContract[tasks].requirements,
        tasksForContract[tasks].competitor
      );
      if (tasksForContract[tasks].decision) {
        console.log(tasksForContract[tasks].decision);
        const operants = [
          tasksForContract[tasks].decision.idToGlobalPayload,
          tasksForContract[tasks].decision.localvalue,
        ];
        //operants.push(tasksForContract[tasks].decision.idToGlobalPayload);
        //operants.push(tasksForContract[tasks].decision.localvalue);
        //console.log(operants);
        setDecision(
          tasksForContract[tasks].id,
          tasksForContract[tasks].decision.gatewaytype,
          tasksForContract[tasks].decision.decisiontype,
          tasksForContract[tasks].decision.operator,
          [
            tasksForContract[tasks].decision.idToGlobalPayload,
            tasksForContract[tasks].decision.localvalue,
          ]
        );
      }
    }
    createGlobalPayloads();
    console.log("Transactions completed");
  };
  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Upload file here:
          <input type="file" onChange={handleUpload} />
        </label>
        <button type="submit">parse from .XML</button>
      </form>
      <form onSubmit={createCCM}>
        <button type="submit">Create CCM</button>
      </form>
      <div>{getTxStatus()}</div>
    </div>
  );
};

export default XMLParser;
