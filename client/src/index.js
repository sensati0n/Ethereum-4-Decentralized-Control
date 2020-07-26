import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import {
  Drizzle,
  generateStore
} from "drizzle";
import CCMStore from "./contracts/ContractCollaborationManager.json";

const ccmoptions = {
  contracts: [CCMStore],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://localhost:9545",
    },
    development: {
      type: "ws",
      url: "ws://172.31.16.1:9545"
    }
  },
};

const ccmDrizzleStore = generateStore(ccmoptions);
const ccmDrizzle = new Drizzle(ccmoptions, ccmDrizzleStore);
console.log(ccmDrizzle);

ReactDOM.render( < App drizzle = {
      ccmDrizzle
    }
    />, document.getElementById("root"));

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
    serviceWorker.unregister();