const ContractCollaborationManager = artifacts.require("ContractCollaborationManager");

contract("ContractCollaborationManager", async accounts => {
    it("Should add a Collaborator", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.addCollaborator(accounts[0], "FirmenName");
        let collaborators = await ccm.getCollaborators();
        let collaboratorCount = await ccm.getCollaboratorCount();
        let isAllowedCollaborator = await ccm.checkForAllowedCollaborator(accounts[0]);

        assert.equal(
            collaborators.includes(accounts[0]),
            true,
            "Collaborator not added correctly!"
        );
        assert.equal(
            collaboratorCount,
            1,
            "Collaborator Count should be 1 after one was added!"
        );
        assert.equal(
            isAllowedCollaborator,
            true,
            "checkForAllowedCollaborator should return true after collaborator is added"
        );
    });

    it("Should create a Task", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.createTask("Check in Customer", accounts[0], 0, []);
        let taskCount = await ccm.getTaskCount();
        assert.equal(
            taskCount,
            1,
            "Task count should be 1 after one was added!"
        );
    });

    it("Should create a second Task", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.createTask("Evaluate Passenger List[Full]", accounts[0], 0, [0]);
        let taskCount = await ccm.getTaskCount();
        assert.equal(
            taskCount,
            2,
            "Task count should be 2 after the second one was added!"
        );
    });

    it("Should create a third Task", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.createTask("Evaluate Passenger List[NotFull]", accounts[0], 0, [0]);
        let taskCount = await ccm.getTaskCount();
        assert.equal(
            taskCount,
            3,
            "Task count should be 3 after the second one was added!"
        );
    });

    it("Should try to complete second Task but fail", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.setTaskOnCompleted(1);
        let complete = await ccm.isTaskCompletedById(1);
        let taskCount = await ccm.getTaskCount();
        assert.equal(
            complete,
            false,
            "Task should not be completed because precondition is not complete"
        );
        complete = await ccm.isTaskCompletedById(0);
        assert.equal(
            complete,
            false,
            "First Task should also be not completed"
        );
        assert.equal(
            taskCount,
            3,
            "Task count should still be 3"
        );
    });

    it("Should set task 0 on complete", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.setTaskOnCompleted(0);
        let complete = await ccm.isTaskCompletedById(0);

        assert.equal(
            complete,
            true,
            "Task 0 should be completed now"
        );
    });

    it("Should create and increment a Global Int Payload", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.createGlobalIntPayload(199);
        let payload = await ccm.getGlobalIntPayloadValueById(0);

        assert.equal(
            payload,
            199,
            "Payload should be 199"
        );
        await ccm.changeGlobalIntPayload(0, Number(Number(payload) + 1));
        payload = await ccm.getGlobalIntPayloadValueById(0);

        assert.equal(
            payload,
            200,
            "Payload should be 200 now"
        );
    });

    it("Should create and change a Global String Payload", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.createGlobalStringPayload("Thisisglobal");
        let payload = await ccm.getGlobalStringPayloadValueById(0);

        assert.equal(
            payload,
            "Thisisglobal",
            "Payload should be 'Thisisglobal'"
        );
        await ccm.changeGlobalStringPayload(0, "Thisisstillglobal");
        payload = await ccm.getGlobalStringPayloadValueById(0);

        assert.equal(
            payload,
            "Thisisstillglobal",
            "Payload should be 'Thisisstillglobal' now"
        );
    });

    it("Should add an int decision to a task", async () => {
        let ccm = await ContractCollaborationManager.deployed();

        // ( id=1, gatewayType=DBEXCL, decisiontype=INTDESC, operator=GREATER, Intoperants[globalid=0,local=200], competitor=2)
        await ccm.addIntDecisionToTaskId(1, 0, 1, 1, [0, 200], [2]);

        // ( id=2, gatewayType=DBEXCL, decisiontype=INTDESC, operator=LEQ, Intoperants[globalid=0,local=200], competitor=1)
        await ccm.addIntDecisionToTaskId(2, 0, 1, 4, [0, 200], [1]);
        let decision1 = await ccm.testIfDecisionExists(1);
        let decision2 = await ccm.testIfDecisionExists(2);

        assert.equal(
            decision1,
            true,
            "Decision for task 1 does not exist allthough it should"
        );
        assert.equal(
            decision2,
            true,
            "Decision for task 2 does not exist allthough it should"
        );
    });

    it("Should create a task and add a string decision to that task", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.createTask("String decision task", accounts[0], 0, [0]);

        // ( id=1, gatewayType=DBEXCL, decisiontype=INTDESC, operator=GREATER, Intoperants[globalid=0,local=200], competitor=2)
        await ccm.addStringDecisionToTaskId(3, 0, 1, 1, [0, "Party"], []);
        let decision1 = await ccm.testIfDecisionExists(3);
        assert.equal(
            decision1,
            true,
            "Decision for task 3 does not exist allthough it should"
        );
    });

    it("Should set string decision task on complete", async () => {
        let ccm = await ContractCollaborationManager.deployed();

        await ccm.setTaskOnCompleted(3);
        let complete = await ccm.isTaskCompletedById(3);

        assert.equal(
            complete,
            true,
            "Task 3 should be completed, Decision should be decided"
        );
    });

    it("Should try to set a decision task on compelete where the decision is not met", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.setTaskOnCompleted(1);
        let complete = await ccm.isTaskCompletedById(1);

        assert.equal(
            complete,
            false,
            "Task should not be completed since the decision is false"
        );
    });

    it("Should set a decision task on compelete and block the decision tasks", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        let complete = await ccm.isTaskCompletedById(2);

        assert.equal(
            complete,
            false,
            "Task should not be completed yet"
        );
        await ccm.setTaskOnCompleted(2);
        complete = await ccm.isTaskCompletedById(2);
        assert.equal(
            complete,
            true,
            "Task should be completed now"
        );


        let resp = await ccm.setTaskOnCompleted(1);
        complete = await ccm.isTaskCompletedById(1);
        assert.equal(
            complete,
            false,
            "First Task cannot get completed anymore! (DB EXCL)"
        );
    });

    it("Should change globalpayload and try to set task on complete again to test if it will be uncompleted", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        await ccm.changeGlobalIntPayload(0, 230);

        let complete = await ccm.isTaskCompletedById(2);

        assert.equal(
            complete,
            true,
            "Task should be completed already"
        );

        await ccm.setTaskOnCompleted(2);
        complete = await ccm.isTaskCompletedById(2);
        assert.equal(
            complete,
            true,
            "Task should still be completed, even though global payload changed and setTaskOnCompleted is called again"
        );
    });




    it("Should test the getTask Method", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        let tasks = await ccm.getTasks();

        assert.equal(
            tasks.toString(),
            "0,1,2,3",
            "There should be 4 tasks"
        );
    });


    it("Should test the getCollaborators Method", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        let collaborators = await ccm.getCollaborators();

        assert.equal(
            collaborators.toString(),
            accounts[0].toString(),
            "There should one account and it should be the first of accounts"
        );

        await ccm.addCollaborator(accounts[1], "Firma B");
        collaborators = await ccm.getCollaborators();

        assert.equal(
            collaborators[1].toString(),
            accounts[1].toString(),
            "There should 2 accounts"
        );
    });

    it("Should test the isDecisionClosed Method", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        let isClosed = await ccm.isDecisionClosed(1);

        assert.equal(
            isClosed,
            true,
            "The decision of task 1 should be closed"
        );
    });

    it("Should test the getTaskById Method", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        let task = await ccm.getTaskById(1);

        assert.equal(
            task.description,
            "Evaluate Passenger List[Full]",
            "The description is not equal"
        );

        assert.equal(
            task.resource,
            accounts[0],
            "The owner is not equal"
        );

    });

    it("Should test DB inclusive gateway", async () => {
        let ccm = await ContractCollaborationManager.deployed();
        let id = await ccm.getTaskCount();
        await ccm.createTask("A", accounts[0], 0, []);

        await ccm.createTask("B", accounts[0], 0, [id]);
        await ccm.createTask("C", accounts[0], 0, [id]);

        await ccm.createGlobalIntPayload(20);
        let payloadID = ccm.getGlobalIntPayloadValueById(1);
    });
});
