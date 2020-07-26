const ContractCollaborationManager = artifacts.require(
  "ContractCollaborationManager"
);
const DecisionLibrary = artifacts.require("DecisionLibrary");

module.exports = function (deployer) {
  // Deploy library LibA, then link LibA to contract B, then deploy B.
  deployer.deploy(DecisionLibrary);
  deployer.link(DecisionLibrary, ContractCollaborationManager);
  deployer.deploy(ContractCollaborationManager);
};
