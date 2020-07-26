class Tasks {
  static getTaskIds(drizzleState, getTasksDataKey) {
    const ccmState = drizzleState.contracts.ContractCollaborationManager;
    const tasksObject = ccmState.getTasks[getTasksDataKey];

    if (tasksObject) {
      return tasksObject.value;
    }
    return [];
  }

  static getAllTasks(drizzleState, getTaskByIdDataKeys, getTasksDataKey) {
    let tasks = [];
    const ccmState = drizzleState.contracts.ContractCollaborationManager;
    const taskIds = this.getTaskIds(drizzleState, getTasksDataKey);

    if (taskIds) {
      for (let index = 0; index < taskIds.length; index++) {
        const tasksObject = ccmState.getTaskById[getTaskByIdDataKeys[index]];
        if (tasksObject) {
          tasks.push({
            description: tasksObject.value.description,
            tasktype: tasksObject.value.tasktype,
            resource: tasksObject.value.resource,
            requirements: tasksObject.value.requirements,
            status: tasksObject.value.status,
            id: index,
            competitors: tasksObject.value.competitors,
          });
        }
      }
    }
    return tasks;
  }

  static getAllTasksPromise(contract, taskCallback) {
    contract.methods
      .getTasks()
      .call()
      .then((taskIds) => {
        taskIds.forEach((taskId) => {
          contract.methods
            .getTaskById(taskId)
            .call()
            .then((task) => {
              let result = {
                description: task.description,
                tasktype: task.tasktype,
                resource: task.resource,
                requirements: task.requirements,
                status: task.status,
                id: taskId,
                competitors: task.competitors,
              };
              taskCallback(taskId, result);
            });
        });
      });
  }

  static async getAllTasksWithDecisionPromise(contract, taskCallback) {
    let taskIds = await contract.methods.getTasks().call();

    taskIds.forEach(async (taskId) => {
      let task = await contract.methods.getTaskById(taskId).call();

      let result = {
        description: task.description,
        tasktype: task.tasktype,
        resource: task.resource,
        requirements: task.requirements,
        status: task.status,
        id: taskId,
        competitors: task.competitors,
      };
      let decisionExists = await contract.methods
        .testIfDecisionExists(taskId)
        .call();
      if (decisionExists) {
        result.operands = {};
        let decisionData;
        let decisionType = await contract.methods
          .getDecisionType(taskId)
          .call();

        if (Number(decisionType) === 0) {
          decisionData = await contract.methods
            .getStringDecision(taskId)
            .call();

          result.operands.global = decisionData.stringoperants[0];
          result.operands.local = decisionData.stringoperants.local;
        } else {
          decisionData = await contract.methods
            .getIntegerDecision(taskId)
            .call();
          result.operands.global = decisionData.integeroperants[0];
          result.operands.local = (decisionData.integeroperants.local).toString();
        }

        result.decisionType = decisionType;
        result.decisionCompleted = decisionData.completed;
        result.decisionType = decisionData.decisionType;
        result.gatewayType = decisionData.gatewaytype;
        result.operator = decisionData.operator;
      }
      taskCallback(taskId, result);
    });
  }
}
export default Tasks;
