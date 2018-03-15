const executeInSeries = require('../src/withRevert');
let collection1 = {};
let collection2 = {1: { collection1: []  }  };


const createDocInCollection1 = (params) => {
  return new Promise((resolve, reject) => {
    collection1[params.id] = params;
    resolve();
  });
}

const updateCollection2 = (params) => {
  return new Promise((resolve, reject) => {
    const doc = collection2[params.id];
    doc.collection1.push(params.collection2Id);
    resolve();
  });
}

const updateObj = [
  {
    updater: {funcToExec: createDocInCollection1, params: {id: 1} },
  },
  {
    updater: {funcToExec: updateCollection2, params: {id: 1, collection2Id: 1} },
  }
];


executeInSeries(updateObj).then(() => {
  // updated objects will be
  // collection1: { '1': { id: 1 } }
  // collection2: { '1': { collection1: [ 1 ] } }
});
