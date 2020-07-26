pragma solidity ^0.5.3;
//pragma solidity >0.4.99 <0.6.0;
pragma experimental ABIEncoderV2;

contract ContractCollaborationManager {

    address public supervisor;
    uint public taskcount;
    uint public collabcount;
    
    enum Tasktype {TASK, AND, OR, XOR}
    enum DecisionType{STRINGDESC,INTDESC,TIMEDESC}
    enum Operator{LESS,GREATER,EQUAL,NEQ,LEQ,GEQ,ELEMENT}
    enum GatewayType{DBEXCL,DBINCL}
    
    event AddedTaskEvent(
        uint indexed taskid
    );
    
    event LastTaskCompleted(
        uint indexed taskid
    );
    
    event ActionEvent(
        uint indexed value,
        address indexed reciever
    );

    struct Action {
        bool exists;
        uint value;
        address payable receiver;
    }

    struct Collaborator {
        string organisation;
        bool exists;
    }

    struct Decision{
        GatewayType gatewaytype;
        DecisionType typ;
        bool completed;
        bool exists;        
        Operator operator;
        IntegerOperants integeroperants;
        StringOperants stringoperants;
    }

    struct IntegerOperants{
        uint idtoglobalintegerpayload;
        uint[] local;
    }

    struct StringOperants{
        uint idtoglobalstringpayload;
        string local;
    }

    struct Task {
        address taskresource;
        bool completed;
        string activity;
        Tasktype tasktype;
        uint[] requirements;
        Decision decision;
        Action action;
        uint[] competitors;
    }

    mapping(uint => Task) tasks;
    uint[] public tasksArray;

    mapping(address => Collaborator) collaborators;
    address[] public collaboratorAddressArray;

    string[] globalStringPayload;
    uint[] globalIntegerPayload;

    /*
    * Initialise the contract with 0 tasks and saves the creator as owner
    */
    constructor() public payable{
        taskcount = 0;
        supervisor = msg.sender;
    }
    
    /*
    * Returns the Balance of the CCM Contract not the library
    */
    function getContractBalance () public view returns(uint){
        return address(this).balance;
    }
    
    /*
    * Makes it possible that you deposit Ether in a contract
    */

    /*
    * Fallback Function to reciever Ether
    */
    function () external payable{
    }
    
    /*
    * creates a new gobal Integer payload and returns the id;
    */
    function createGlobalIntPayload(uint _gint) public returns (uint){
        globalIntegerPayload.push(_gint);
        return(globalIntegerPayload.length - 1);
    }

    /*
    * Get the value of an globalintegerpayload by the id
    */
    function getGlobalIntPayloadValueById(uint _gintid) public view returns (uint) {
        return globalIntegerPayload[_gintid];
    }

    /*
    * Get the value of an globalstringpayload by the id
    */
    function getGlobalStringPayloadValueById(uint _gstrid) public view returns (string memory) {
        return globalStringPayload[_gstrid];
    }


    /*
    * creates a new gobal string payload and returns the id;
    */
    function createGlobalStringPayload(string memory _gstring) public returns (uint){
        //require(msg.sender == supervisor);
        globalStringPayload.push(_gstring);
        return(globalStringPayload.length - 1);
    }

    //TODO Eval ob exists sinn macht
    //TODO Nur Collab dürfen ändern!!
    function changeGlobalIntPayload(uint _id,uint _value) public returns (bool){
        //require(msg.sender == supervisor);
        globalIntegerPayload[_id] = _value;
        return true;
    }
    
    function changeGlobalStringPayload(uint _id, string memory _value) public returns (bool){
        //require(msg.sender == supervisor);
        globalStringPayload[_id] = _value;
        return true;
    }

    function getGlobalIntegerPayloadCount() public view returns (uint payloadCount){
        return globalIntegerPayload.length;
    }

    function getGlobalStringPayloadCount() public view returns (uint payloadCount){
        return globalStringPayload.length;
    }

    /*
    * @param: Address of the Collaborator and his Organisation
    */
    function addCollaborator(address _collaborator, string memory _organisation) public {
        //Only ContractOwner can add collaborators
        //require(msg.sender == supervisor, "Only the contract owner can add new collaborators");
        require(checkForAllowedCollaborator(_collaborator) == false,"Collaborator already added");
        Collaborator storage collaborator = collaborators[_collaborator];
        collaborator.organisation = _organisation;
        collaborator.exists = true;
        collaboratorAddressArray.push(_collaborator) - 1;
    }

    function checkForAllowedCollaborator(address _toaddcollaborator) public view returns(bool){
        return collaborators[_toaddcollaborator].exists;
    }

    /*
    * @Param: Creates a Task
    *
    */
    function createTask(string memory _activity,
                        address _taskresource,
                        Tasktype _tasktype,
                         uint[] memory _requirements, uint[] memory _competitors) public {
        //require(msg.sender == supervisor, "Not Supervisor");
        require(checkForAllowedCollaborator(_taskresource) == true,"Collaborator not added");
        Task storage task = tasks[taskcount];
        task.taskresource = _taskresource;
        task.completed = false;
        task.activity = _activity;
        task.tasktype = _tasktype;
        task.requirements = _requirements;
        task.competitors = _competitors;
        tasksArray.push(taskcount);
        taskcount++;
        emit AddedTaskEvent(taskcount-1);
    }

    function testIfDecisionExists(uint _id) public view returns (bool){
        
        if(tasks[_id].decision.exists == true){
            return true;
        }
        else return false;

    }

    function getDecisionType(uint _id) public view returns (DecisionType decisionType){
        return tasks[_id].decision.typ;
    }

    function getStringDecision(uint _id) public view returns(GatewayType gatewaytype,
        DecisionType decisionType, bool completed, uint[] memory competitors, Operator operator,
        StringOperants memory stringoperants){
        require(testIfDecisionExists(_id),"task has no decision");
        return (tasks[_id].decision.gatewaytype, tasks[_id].decision.typ, tasks[_id].decision.completed,
        tasks[_id].competitors, tasks[_id].decision.operator, tasks[_id].decision.stringoperants);           
    }

    function getIntegerDecision(uint _id) public view returns(GatewayType gatewaytype,
        DecisionType decisionType, bool completed, uint[] memory competitors, Operator operator,
        IntegerOperants memory integeroperants){
        require(testIfDecisionExists(_id),"task has no decision");
        return (tasks[_id].decision.gatewaytype, tasks[_id].decision.typ, tasks[_id].decision.completed,
        tasks[_id].competitors, tasks[_id].decision.operator, tasks[_id].decision.integeroperants);               
    }


    function testIfActionExists(uint _id) public view returns (bool){
        if(tasks[_id].action.exists == true){
            return true;
        }
        else return false;
    }

    function addIntDecisionToTaskId(uint _id,
                                     GatewayType _gatewaytype,
                                     DecisionType _type,
                                     Operator _op,
                                      IntegerOperants memory _intoperants
                                     ) public returns (bool) {
        //require(supervisor == msg.sender, "Your not allowed");
        if(testIfDecisionExists(_id) || testIfActionExists(_id)){
            return false;
        }
        else{
            tasks[_id].decision.gatewaytype = _gatewaytype;
            tasks[_id].decision.typ = _type;
            tasks[_id].decision.operator = _op;
            tasks[_id].decision.integeroperants = _intoperants;
            tasks[_id].decision.exists = true;
            return true;
        }
    }

   function addStringDecisionToTaskId(uint _id,
                                        GatewayType _gatewaytype,
                                        DecisionType _type,
                                        Operator _op,
                                        StringOperants memory _stroperants
                                        ) public returns (bool){
        //require(supervisor == msg.sender, "Your not allowed");
        if(testIfDecisionExists(_id) || testIfActionExists(_id)){
            return false;
        } 
        else{
            tasks[_id].decision.gatewaytype = _gatewaytype;
            tasks[_id].decision.typ = _type;
            tasks[_id].decision.operator = _op;
            tasks[_id].decision.stringoperants = _stroperants;
            tasks[_id].decision.exists = true;
            return true;
        }
    }

    function addActionToTaskId(uint _id, uint _value, address payable _receiver) public returns (bool){
       
        //require(supervisor == msg.sender, "Your not allowed");
        if(testIfDecisionExists(_id) || testIfActionExists(_id)){
            return false;
        }
        else{
            tasks[_id].action.value = _value;
            tasks[_id].action.exists = true;
            tasks[_id].action.receiver = _receiver;
            return true;
        }
    }

    function getTasks()  public view returns (uint[] memory){
        return tasksArray;
    }

    function getCollaborators()  public view returns (address[] memory){
        return collaboratorAddressArray;
    }

    //Pay attetnion that only one string stays in memory in case of memory size.
    function stringEquals(string memory _firststring, string memory _secondstring) public pure returns (bool){
        if (keccak256(abi.encodePacked(_firststring)) != keccak256(abi.encodePacked(_secondstring))) {
            return false;
        }
        else {
            bytes memory a = bytes(_firststring);
            bytes memory b = bytes(_secondstring);
            if (a.length != b.length) {
                return false;
            }
            for (uint i = 0; i < a.length; i ++) {
                if (a[i] != b[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    /*
    * Internal function for Action Events to transfer Funds.
    */

    function transferFunds(uint _id) private {
        require(address(this).balance > tasks[_id].action.value, "Contract has not enough funds");
        address payable _to = tasks[_id].action.receiver;
        _to.transfer(tasks[_id].action.value);
    }

    /*
    * @Para: Evalutes the list of a competitors of a DB Exclusion Task
    */
    function isDecisionClosed(uint _id) public view returns (bool) {
        if(tasks[_id].decision.completed){
            return true;
        }
        for(uint i = 0; i < tasks[_id].competitors.length; i++){
            uint comp_id = tasks[_id].competitors[i];
            if(tasks[comp_id].decision.completed == true){
                return true;
            }
        }
        return false;
    }

    function emitTaskCompletedEvents(uint _id) private{
        emit LastTaskCompleted(_id);
        if(tasks[_id].action.exists){
            emit ActionEvent(tasks[_id].action.value, tasks[_id].action.receiver);
        }
    }

    /*
    * @Param: sets a Task on completed if resource equal to taskresource
    */
    function setTaskOnCompleted(uint _id) public returns (bool success){
        uint tempcount;
        require(tasks[_id].taskresource == msg.sender, "Not the right resource");

        // if task is already completed return true
        if (tasks[_id].completed == true) {
            return true;
        }
        uint[] memory temprequire = tasks[_id].requirements;
        if (temprequire.length == 0) {
                if(testIfDecisionExists(_id)){
                    return setDecisionTaskOnCompleted(_id);
                }
                if(testIfActionExists(_id)){
                    transferFunds(_id);
                    emit ActionEvent(tasks[_id].action.value,tasks[_id].action.receiver);
                    return true;
                }                
                else{
                    tasks[_id].completed = true;
                    emitTaskCompletedEvents(_id);
                    return true;
                }
        }
        //TASK
        if (tasks[_id].tasktype == Tasktype.TASK) {
            if (isTaskCompletedById(temprequire[0]) == true) {
                
                if(testIfDecisionExists(_id)){
                    return setDecisionTaskOnCompleted(_id);
                }
                if(testIfActionExists(_id)){
                    transferFunds(_id);
                    emit ActionEvent(tasks[_id].action.value,tasks[_id].action.receiver);
                    return true;
                }                
                else{
                    tasks[_id].completed = true;
                    emitTaskCompletedEvents(_id);
                    return true;
                }
            }
            else {
                return false;
            }
        }

        // ---------- GATES ----------
        // AND
        if (tasks[_id].tasktype == Tasktype.AND) {
            for (uint i = 0; i < temprequire.length; i++) {
                if (isTaskCompletedById(temprequire[i]) == true) {
                    tempcount++;
                }
            }
            if (tempcount == temprequire.length) {
                tasks[_id].completed = true;
                emit LastTaskCompleted(_id);
                return true;
            }
            else {
                return false;

            }
        }
        // atleast 1
        if (tasks[_id].tasktype == Tasktype.OR) {
            for (uint j = 0; j < temprequire.length; j++) {
                if (isTaskCompletedById(temprequire[j]) == true) {
                    tempcount++;
                }
            }
            if (tempcount > 0) {
                tasks[_id].completed = true;
                emit LastTaskCompleted(_id);
                return true;
            }
            else {
                return false;
            }
        }
        // exactly 1
        if (tasks[_id].tasktype == Tasktype.XOR) {
            for (uint k = 0; k < temprequire.length; k++) {
                if (isTaskCompletedById(temprequire[k]) == true) {
                    tempcount++;
                }
            }
            if (tempcount == 1) {
                tasks[_id].completed = true;
                emit LastTaskCompleted(_id);
                return true;
            }
            else {
                return false;
            }
        }
    }

    function setDecisionTaskOnCompleted(uint _id) private returns (bool success){        
        bool result = evaluateDecision(tasks[_id].decision);
        //require(evaluateDecision(tasks[_id].decision) == false, "Decisionevaluation returned false");       
        if(result){
            //if the result is true we need to check for the dbexcl type to handle competitors
            if(tasks[_id].decision.gatewaytype == GatewayType.DBEXCL){
            //we need to check if the decision was already fullfilled, if so ignore competitors and return false
                if(isDecisionClosed(_id) == false){
                        //here we accept that the decision is true, the gwtype is dbexcl and now we want to lock every competitor with true
                        for(uint i = 0; i < tasks[_id].competitors.length; i++){
                            uint comp_id = tasks[_id].competitors[i];
                            tasks[comp_id].decision.completed = true;
                        }                        
                     }else{
                        return false;
                     }
                }
                tasks[_id].decision.completed = true;
                tasks[_id].completed = true;                            
                emitTaskCompletedEvents(_id);
                return true;
            }
            return false;                
    }
    /*
    * @param: ID of a Task
    * @returns: bool value if task is completed
    */
    function isTaskCompletedById(uint _id) public view returns (bool success){
        if (tasks[_id].completed == true) {
            return true;
        }
        else return false;
    }

    /*
    * @param: Id of a State
    * @returns: status and description of the Task
    */
    function getTaskById(uint _id) public view returns (bool status,
        string memory description, address resource, Tasktype tasktype,
        uint[] memory requirements, uint[] memory competitors){
        return (tasks[_id].completed, tasks[_id].activity,
         tasks[_id].taskresource, tasks[_id].tasktype, tasks[_id].requirements, tasks[_id].competitors);
    }

    /*
    * @param: Id
    * @returns: status of a task
    */
    function getTaskStatusById(uint _id) public view returns (bool){
        return (tasks[_id].completed);
    }

    /*
    * @param: Id
    * @returns: description of a task
    */
    function getTaskActivityById(uint _id) public view returns (string memory){
        return (tasks[_id].activity);
    }

    /*
    * @param: Id
    * @returns: description of a task
    */
    function getTaskRequirementsById(uint _id) public view returns (uint[] memory) {
        return (tasks[_id].requirements);
    }


    function getCollaboratorCount() public view returns (uint){
        return collaboratorAddressArray.length;
    }

    /*
    * @Returnsd: Amout of States in the Collaboration
    */
    function getTaskCount() public view returns (uint){
        return taskcount;
    }

    //USING EXPERIMENTALENCODER V2 for struct as args
    function evaluateDecision(Decision memory _decision) public view returns (bool){
        if(_decision.typ == DecisionType.STRINGDESC){
            string memory stringpayload = globalStringPayload[_decision.stringoperants.idtoglobalstringpayload];
            return DecisionLibrary.evaluate(stringpayload,_decision.operator, _decision.stringoperants.local);
        }
        else if(_decision.typ == DecisionType.INTDESC){
            uint intpayload = globalIntegerPayload[_decision.integeroperants.idtoglobalintegerpayload];
            return DecisionLibrary.evaluate(intpayload, _decision.operator, _decision.integeroperants.local);
        }
    }    
}


library DecisionLibrary{

    function evaluate(string memory _firststring,ContractCollaborationManager.Operator _op,string memory _secondstring) public pure returns (bool){
        if(_op == ContractCollaborationManager.Operator.EQUAL){
            // Required way to string compare
            if(keccak256(abi.encodePacked(_firststring)) == keccak256(abi.encodePacked(_secondstring))){
                return true;
            }
            else return false;
        }
        else if(_op != ContractCollaborationManager.Operator.NEQ){
            if(keccak256(abi.encodePacked(_firststring)) != keccak256(abi.encodePacked(_secondstring))){
                return true;
            }
            else return false;
        }
        else return false;
    }
    // Evaluates a decision based on int
    function evaluate(uint _firstint, ContractCollaborationManager.Operator _op, uint[] memory _secondint)
        public pure returns(bool status){
        // a < b
        if(_op == ContractCollaborationManager.Operator.LESS){

            if(_firstint < _secondint[0]){
                return true;
            }
            else return false;
        }

        // a > b
        if(_op == ContractCollaborationManager.Operator.GREATER){

            if(_firstint > _secondint[0]){
                return true;
            }
            else return false;
        }

        // a = b
        if(_op == ContractCollaborationManager.Operator.EQUAL){

            if(_firstint == _secondint[0]){
                return true;
            }
            else return false;
        }

        // a <= b
        if(_op == ContractCollaborationManager.Operator.LEQ){
            if(_firstint <= _secondint[0]){
                return true;
            }
            else return false;
        }

        // a >= b
        if(_op == ContractCollaborationManager.Operator.GEQ){

            if(_firstint >= _secondint[0]){
                return true;
            }
            else return false;
        }
        
        if(_op == ContractCollaborationManager.Operator.ELEMENT){
            for (uint elementid = 0; elementid < _secondint.length ; elementid++){
                if (_firstint == _secondint[elementid]){
                    return true;
                }
            }           
        }
        return false;
    }
}

