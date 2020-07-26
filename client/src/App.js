import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";

import "./App.css";
import Supervisor from "./SupervisorComponent";
import Collaborators from "./CollaboratorsComponent";
import CreateTaskComponent from "./CreateTaskComponent";
import TaskTable from "./TaskTableComponent";
import AccountSelectorComponent from "./AccountSelectorComponent";
import { Menu, Loader, Grid } from "semantic-ui-react";
import CreateGlobalPayloadComponent from "./CreateGlobalPayloadComponent";
import AddDecisionComponent from "./AddDecisionComponent";
import CompleteTaskComponent from "./CompleteTaskComponent";
import UserViewComponent from "./UserViewComponent";
import ChangeGlobalPayloadComponent from "./ChangeGlobalPayloadComponent";
import ActionComponent from "./ActionComponent";
import XMLParserComponent from "./XMLParser";
import OverviewComponent from "./OverviewComponent";

class App extends Component {
  state = {
    loading: true,
    drizzleState: null,
    drizzle: null,
    defaultAccount: null,
  };

  constructor(props, context) {
    super(props, context);
    React.createContext();
  }
  componentDidMount() {
    const { drizzle } = this.props;
    this.handleItemClick = this.handleItemClick.bind(this);
    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {
      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState, drizzle });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
  };

  showSelectAccountError() {}

  renderMenu() {
    const { activeItem } = this.state;
    return (
      <div className="Menu">
        <Menu vertical inverted color={"grey"} size="huge">
          <Menu.Item>
            <Menu.Header>Task</Menu.Header>
            <Menu.Menu>
              <Menu.Item
                name="Show Tasks"
                active={activeItem === "Show Tasks"}
                onClick={this.handleItemClick}
                as={Link}
                to="/"
              ></Menu.Item>
              <Menu.Item
                name="Create Task"
                active={activeItem === "Create Task"}
                onClick={this.handleItemClick}
                as={Link}
                to="/create_task"
              ></Menu.Item>
              <Menu.Item
                name="Add Decision to Task"
                active={activeItem === "Add Decision to Task"}
                onClick={this.handleItemClick}
                as={Link}
                to="/add_task_decision"
              ></Menu.Item>
              <Menu.Item
                name="Add Action to Task"
                active={activeItem === "Add Action to Task"}
                onClick={this.handleItemClick}
                as={Link}
                to="/add_action"
              ></Menu.Item>
              <Menu.Item
                name="Complete Task"
                active={activeItem === "Complete Task"}
                onClick={this.handleItemClick}
                as={Link}
                to="/complete_task"
              ></Menu.Item>
            </Menu.Menu>
          </Menu.Item>

          <Menu.Item>
            <Menu.Header>Payload</Menu.Header>
            <Menu.Menu>
              <Menu.Item
                name="Create Global Payload"
                active={activeItem === "Create Global Payload"}
                onClick={this.handleItemClick}
                as={Link}
                to="/create_global_payload"
              ></Menu.Item>
              <Menu.Item
                name="Change Global Payload"
                active={activeItem === "Change Global Payload"}
                onClick={this.handleItemClick}
                as={Link}
                to="/change_global_payload"
              ></Menu.Item>
            </Menu.Menu>
          </Menu.Item>

          <Menu.Item
            name="Add Collaborator"
            active={activeItem === "Add Collaborator"}
            onClick={this.handleItemClick}
            as={Link}
            to="/add_collaborator"
          ></Menu.Item>
          <Menu.Item
            name="XML-Parser"
            active={activeItem === "XML Parser"}
            onClick={this.handleItemClick}
            as={Link}
            to="/xml_parser"
          ></Menu.Item>
          <Menu.Item
            name="Overview"
            active={activeItem === "Overview"}
            onClick={this.handleItemClick}
            as={Link}
            to="/overview"
          ></Menu.Item>
        </Menu>
      </div>
    );
  }

  renderAccountSelector() {
    return (
      <div className="acc-selector">
        <AccountSelectorComponent
          drizzle={this.state.drizzle}
          drizzleState={this.state.drizzleState}
          onAccountChanged={(selectedAccount) => {
            this.setState({ defaultAccount: selectedAccount });
          }}
        />
      </div>
    );
  }

  render() {
    if (this.state.loading)
      return (
        <div className="loading-screen">
          {" "}
          <Loader active size="big" inline="centered">
            Initializing...
          </Loader>
        </div>
      );

    return (
      <Router>
        <div className="App">
          <Grid doubling>
            <Grid.Column width={4}>
              {this.renderMenu()}
              {this.renderAccountSelector()}
            </Grid.Column>
            <Grid.Column width={6}>
              <div className="main-content">
                <Switch>
                  <Route
                    path="/add_collaborator"
                    render={() => (
                      <div>
                        <Supervisor
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                        />
                        <Collaborators
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />

                  <Route
                    path="/create_task"
                    render={() => (
                      <div>
                        <CreateTaskComponent
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />
                  <Route
                    path="/create_global_payload"
                    render={() => (
                      <div>
                        <CreateGlobalPayloadComponent
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />

                  <Route
                    path="/change_global_payload"
                    render={() => (
                      <div>
                        <ChangeGlobalPayloadComponent
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />

                  <Route
                    path="/add_task_decision"
                    render={() => (
                      <div>
                        <AddDecisionComponent
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />
                  <Route
                    path="/complete_task"
                    render={() => (
                      <div>
                        <CompleteTaskComponent
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />
                  <Route
                    path="/xml_parser"
                    render={() => (
                      <div>
                        <XMLParserComponent
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />
                  <Route
                    path="/add_action"
                    render={() => (
                      <div>
                        <ActionComponent
                          drizzle={this.state.drizzle}
                          drizzleState={this.state.drizzleState}
                          defaultAccount={this.state.defaultAccount}
                        />
                      </div>
                    )}
                  />

                  <Route
                    exact
                    path="/"
                    render={() => (
                      <TaskTable
                        drizzle={this.state.drizzle}
                        drizzleState={this.state.drizzleState}
                      />
                    )}
                  />
                </Switch>
              </div>
            </Grid.Column>
          </Grid>
        </div>
      </Router>
    );
  }
}

export default App;
