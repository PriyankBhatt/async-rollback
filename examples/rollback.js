const _ = require('lodash');
const asyncRollback = require('../src/withRevert');
let collection1 = {};
let collection2 = {1: { collection1: []  }  };


const createDocInCollection1 = (params) => {
  return new Promise((resolve, reject) => {
    collection1[params.id] = params;
    resolve();
  });
}

const deleteDocInCollection1 = (params) => {
  return new Promise((resolve, reject) => {
    collection1 = _.omit(collection1, params.id);
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
    transaction: {funcToExec: createDocInCollection1, params: {id: 1} },
    rollback: {funcToExec: deleteDocInCollection1, params: {id: 1} },
  },
  {
    transaction: {funcToExec: updateCollection2, params: {id: 1, collection2Id: 1} },
  }
];


asyncRollback(updateObj).catch(() => {
  // although 1st function was successful 2nd function lead to an error
  // so util called 1st function revert method and it reverted collection1

  // hence updated collections are
  // collection1: { }
  // collection2: { '1': { collection1: [] } }
});
