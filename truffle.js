module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "0.0.0.0", //change here
      port: 9545,
      network_id: "*", // Match any network id
    },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};