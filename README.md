# Blockchain-Databased-Decision-BPMN-Engine

This project extension is based on the bachelor thesis of Jonas Szalanczi "Implementation of a smart contract for Process Execution on the Blockchain" and the paper [A Lean Architecture for Blockchain Based Decentralized Process Execution](https://link.springer.com/chapter/10.1007%2F978-3-030-11641-5_29).

The goal of this extension is to enhance the previous concept by the possibility of data-driven decisions and to make them tangible with the help of a simple graphical user interface.

## Disclaimer

Please be aware that this is a constantly evolving product. Also the used technologies develop further monthly. We try to make the usability possible for as many environments as possible, but cannot guarantee it.
If you stumble across bugs in the implementation, you are welcome to add them to the Issue Tracker.

## Setup

Unix System with Python2 and Python3 preinstalled.
[truffle](https://truffleframework.com/truffle), [drizzle](https://truffleframework.com/drizzle) and [ganache-cli](https://github.com/trufflesuite/ganache-cli) need to be installed global via the [npm](https://www.npmjs.com/) package manager. Solidity Compiler via sudo apt-get

```
$ npm install -g truffle
$ sudo apt-get install solc
```

Open a new terminal in the project folder and migrate the ContractCollaborationManager.sol to the Blockchain.

```
$ truffle develop
$ (truffle) compile
$ (truffle) migrate
```

Open a second terminal and change the directory into the client directory of the project.

```
$ cd client
```

Install the package requirements and Update your drizzle to web3 Version manually to 1.0.36

```
$ npm install
$ cd nodemodules/drizzle/
$ npm install web3@1.0.0-beta.36
$ cd ..
$ npm install bpmn-moddle@6.0.0
```

Then you can run the application by starting the npm server.

```
$ npm start
```

## Class diagram

![Text to show](https://github.com/Jonasmpi/drizzle_react/blob/master/public/Klassendiagramm.svg "class diagram")

## Usage

The first step is to add a collaborator by clicking on `Add Collaborator` in the left menu. Then you have to select which account should be added and set a name.
The next step is to create a task. This can be done in the `create Task` menu option. Here you set a name for the `activity` (a string that describes the activity), select the responsible `account`, select a task `type` and set if this task has any other tasks (`requirements`) that need to be completed before this task can be completed (this should not be the case since it is the first task).
Then you click on `Create Task`.

## Launch Testcase

Depeding on OS hit ^ or shift+^ on your Keyboard for the Creation of a Usecase. You should see a logoutput after pressing in the Developmentconsole (F12).
