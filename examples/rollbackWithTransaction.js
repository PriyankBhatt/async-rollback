const _ = require('lodash');
const asyncRollback = require('../src/withRevert');
let collection1 = {};
let collection2 = {1: { collection1: []  }  };


const createDocInCollection1 = (params) => {
  return new Promise((resolve, reject) => {
    const newParams = Object.assign({}, params);
    newParams.id = 1;
    collection1[newParams.id] = newParams;
    resolve(newParams);
  });
}

const deleteDocInCollection1 = (params, transactionResponse) => {
  return new Promise((resolve, reject) => {
    // whatever was resolved in createDocInCollection1 is used a parameter for deleteDocInCollection1
    // this can be used when you are calling db to create a document and in revert method you are deleting
    // that document.
    collection1 = _.omit(collection1, transactionResponse.id);
    resolve();
  })
}

const updateCollection2 = (params) => {
  return new Promise((resolve, reject) => {
    reject();
  });
}

const updateObj = [
  {
    transaction: {funcToExec: createDocInCollection1, params: {firstname: 'Helloworld'} },
    rollback: {funcToExec: deleteDocInCollection1, useUpdaterResponse: true},
  },
  {
    transaction: {funcToExec: updateCollection2, params: {id: 1} },
  }
];


asyncRollback(updateObj).catch(() => {
  // although 1st function was successful 2nd function lead to an error
  // so util called 1st function revert method with update's response as params
  // and it reverted collection1

  // hence updated collections are
  // collection1: { }
  // collection2: { '1': { collection1: [] } }
});
