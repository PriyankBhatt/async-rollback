const _ = require('lodash');
const executeInSeries = require('../src/withRevert');
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

const deleteDocInCollection1 = (params) => {
  return new Promise((resolve, reject) => {
    // whatever was resolved in createDocInCollection1 is used a parameter for deleteDocInCollection1
    // this can be used when you are calling db to create a document and in revert method you are deleting
    // that document.
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
    updater: {funcToExec: createDocInCollection1, params: {firstname: 'Helloworld'} },
    reverter: {funcToExec: deleteDocInCollection1, useUpdaterResponse: true},
  },
  {
    updater: {funcToExec: updateCollection2, params: {id: 1} },
  }
];


executeInSeries(updateObj).catch(() => {
  // although 1st function was successful 2nd function lead to an error
  // so util called 1st function revert method with update's response as params
  // and it reverted collection1
});
