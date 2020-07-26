pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ContractCollaborationManager.sol";

contract ContractCollaborationManagerTest {
    // The address of the ContractCollaborationManager contract to be tested
    ContractCollaborationManager ccm = ContractCollaborationManager(DeployedAddresses.ContractCollaborationManager());
    address supervisor = address(this);
    address deployer = ccm.supervisor();
    

    function testAddCollaborator() public {         
        uint count = 0;
        count = ccm.getCollaboratorCount();
        Assert.equal(count,0, "Collaborator count should be empty on initialisation");
        ccm.addCollaborator(supervisor, "Firmenname");
        count = ccm.getCollaboratorCount();
        Assert.equal(count,1, "Collaborator count should be 1 after on is added");
    }
    /*
    * Testing a simple adding of a task w/o requirements
    */
    function testAddTask() public {
        uint taskcount = 0;
        Assert.equal(taskcount, ccm.getTaskCount(), "Initialier Taskcount was not zeroed");               
        uint[] memory req;
        uint[] memory empty;
        ccm.createTask("A", supervisor, ContractCollaborationManager.Tasktype.TASK, req,empty);
        uint tasks = ccm.getTaskCount();
        Assert.equal(tasks, 1, "Not Equal");
    }
    /*
    * Testing a simple completion of a task before added
    */
    
    function testCompleteSimpleTask() public {
        Assert.equal(ccm.setTaskOnCompleted(0), true, "Task could not be completed");
         
    }
    
    /*
    * Testing of a Row of 3 Tasks with chaining requirements
    * A->B->C
    */
    function testSimpleTaskChain() public {
        
        uint[] memory empty;
        Assert.equal(1, ccm.getTaskCount(), "Taskcount should 1 because A already added");
        //
        uint[] memory reqA;
        ccm.createTask("A", supervisor, ContractCollaborationManager.Tasktype.TASK, reqA,empty);

        uint[] memory reqB = new uint[](1);
        reqB[0] = 1;        
        ccm.createTask("B", supervisor, ContractCollaborationManager.Tasktype.TASK, reqB,empty);
        Assert.equal(3, ccm.getTaskCount(), "Taskcount should 2 because A,A,B already added");

        uint[] memory reqC = new uint[](1);
        reqC[0] = 2;
        ccm.createTask("C", supervisor, ContractCollaborationManager.Tasktype.TASK, reqC,empty);
        Assert.equal(4, ccm.getTaskCount(), "Taskcount should 5 because A,A,B,C,D already added");
 
        Assert.equal(false, ccm.getTaskStatusById(3), "Task C should be false");
        Assert.equal("C", ccm.getTaskActivityById(3), "Task Activity should be C");
        Assert.equal(false, ccm.setTaskOnCompleted(3), "Task C(id=2) should not be completable");
        Assert.equal(false, ccm.getTaskStatusById(3), "Task C should be false");

        Assert.equal(false, ccm.getTaskStatusById(2), "Task B should be false");
        Assert.equal("B", ccm.getTaskActivityById(2), "Task Activity should be B");
        Assert.equal(ccm.setTaskOnCompleted(2), false, "Task B(id=2) should not be completable");
        Assert.equal(true, ccm.setTaskOnCompleted(1), "Task A should be completable");
        Assert.equal(true, ccm.setTaskOnCompleted(2), "Task B should be completable");
        Assert.equal(true, ccm.setTaskOnCompleted(3), "Task C should be be completable");
    }

    /*        ->(C)-> (F) ---
    *        |               |(
    * A->B->(X)->(D)-> (G)->(X)->(Z) with Decision on C with (i > 5), D (i = 5) and E( i < 5) and a globalpayload(i)) at A with i = 2, at B with i=6
    *        |               |
    *         ->(E)-> (H) ---
    */
    function testDBexclusiveIntegerGateWay() public {
        uint[] memory empty;
        Assert.equal(0,ccm.createGlobalIntPayload(2), "ID des Payloads sollte 0 sein");
        Assert.equal(2,ccm.getGlobalIntPayloadValueById(0), "Value of payload 0 should be 2");        
        // id = 4
        uint[] memory requA;
        ccm.createTask("A", supervisor, ContractCollaborationManager.Tasktype.TASK, requA,empty);

        // id = 5
        uint[] memory requB = new uint[](1);
        requB[0] = 4;
        ccm.createTask("B", supervisor, ContractCollaborationManager.Tasktype.TASK, requB,empty);
        
        // id = 6

        uint[] memory requC = new uint[](1);
        requC[0] = 5;
        

        
        uint[] memory competitorsC = new uint[](2);
        competitorsC[0] = 7;
        competitorsC[1] = 8;
        ccm.createTask("C", supervisor, ContractCollaborationManager.Tasktype.TASK, requC,competitorsC);
       
        ccm.addIntDecisionToTaskId(6, ContractCollaborationManager.GatewayType.DBEXCL,
                            ContractCollaborationManager.DecisionType.INTDESC,
                            ContractCollaborationManager.Operator.LESS,
                            ContractCollaborationManager.IntegerOperants(0,5)
                            );

        // id = 7
        uint[] memory requD = new uint[](1);
        requD[0] = 5;
        

        uint[] memory competitorsD = new uint[](2);
        competitorsD[0] = 6;
        competitorsD[1] = 8;
        
        ccm.createTask("D", supervisor, ContractCollaborationManager.Tasktype.TASK, requD,competitorsD);
        ccm.addIntDecisionToTaskId(7, ContractCollaborationManager.GatewayType.DBEXCL,
                            ContractCollaborationManager.DecisionType.INTDESC,
                            ContractCollaborationManager.Operator.EQUAL,
                            ContractCollaborationManager.IntegerOperants(0,5)
                            );

        // id = 8
        uint[] memory requE = new uint[](1);
        requE[0] = 5;
        
        
        uint[] memory competitorsE = new uint[](2);
        competitorsE[0] = 6;
        competitorsE[1] = 7;
        
        ccm.createTask("E", supervisor, ContractCollaborationManager.Tasktype.TASK, requE,competitorsE);
        ccm.addIntDecisionToTaskId(8, ContractCollaborationManager.GatewayType.DBEXCL,
                            ContractCollaborationManager.DecisionType.INTDESC,
                            ContractCollaborationManager.Operator.GREATER,
                            ContractCollaborationManager.IntegerOperants(0,5)
                            );


        // id = 9
        uint[] memory requF = new uint[](1);
        requF[0] = 6;
        ccm.createTask("F", supervisor, ContractCollaborationManager.Tasktype.TASK, requF,empty);
        

        // id = 10
        uint[] memory requG = new uint[](1);
        requG[0] = 7;
        ccm.createTask("G", supervisor, ContractCollaborationManager.Tasktype.TASK, requG,empty);
        
        // id = 11
        uint[] memory requH = new uint[](1);
        requH[0] = 8;
        uint[] memory leer;
        ccm.createTask("H", supervisor, ContractCollaborationManager.Tasktype.TASK, requH,leer);
        
        // id = 12

        //uint[] memory requZ = new uint[](3);
        //requZ[0] = 9;
        //requZ[1] = 10;
        //requZ[2] = 11;
        //ccm.createTask("Z", supervisor, ContractCollaborationManager.Tasktype.XOR, requZ,empty);
        //Assert.equal(ccm.getTaskActivityById(12),"Z","Should be 12=Z");
        //Assert.equal(13, ccm.getTaskCount(), "TaskCount should be 13");


        //Checking IN
        //Assert.equal(ccm.setTaskOnCompleted(12),false,"X should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(11),false,"I should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(10),false,"H should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(9),false,"F should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(8),false,"E should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(7),false,"D should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(6),false,"C should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(5),false,"B should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(4),true,"A should be completable");

        //Assert.equal(ccm.setTaskOnCompleted(12),false,"X should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(11),false,"I should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(10),false,"H should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(9),false,"F should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(8),false,"E should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(7),false,"D should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(6),false,"C should not be completable");
        Assert.equal(ccm.setTaskOnCompleted(5),true,"B should be completable");
        
        ccm.changeGlobalIntPayload(0,6);
        Assert.equal(ccm.getGlobalIntPayloadValueById(0), 6, "Payload should be 6 here");
        
        Assert.equal(ccm.getTaskActivityById(7),"D", "Should be acitivity D");
        Assert.equal(ccm.testIfDecisionExists(7), true, "D Should have a Decision");
        Assert.equal(ccm.setTaskOnCompleted(7), false, "D should because of Payload not be completable");
        Assert.equal(ccm.setTaskOnCompleted(6), false, "C should because of Payload not be completable");
        Assert.equal(ccm.setTaskOnCompleted(8), true, "E should because of Payload be completable");

        ccm.changeGlobalIntPayload(0,5);
        Assert.equal(ccm.setTaskOnCompleted(7), false, " D should be locked because E already fullfilled");
        Assert.equal(ccm.setTaskOnCompleted(6), false, " C should be locked because E already fullfilled");
        Assert.equal(ccm.setTaskOnCompleted(11), true, " H should be completable");
        //Assert.equal(ccm.setTaskOnCompleted(12), true, "Z should be completable because H is done");        
    }





}