const _ = require('lodash');
const Promise = require('bluebird');

function createPromise() {
  var resolve, reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  })
  return {promise, resolve, reject};
}

function throwErrorOnRejection() {
  throw Error();
}

const setNextUpdateParams = (prevUpdateParams) => function(newParams) {
  return Object.assign(prevUpdateParams, newParams); // assuming prevUpdateParams is always and object and corresponding new params too.
}

const setUpdateResponse = (updaterResponse, index, callback) => function setData(data) {
  updaterResponse[index] = data;
  callback(data);
}

/**
 * function is called when for updating
 * @param {Object} params
   @param params.globalResolve: called when all the request are completed
   @param params.globalReject: called after reverting all the updates.
   @param params.numOfUpdates: total updates to iterate upon
   @param params.updaterResponse: update responses array.
   @param params.updateConfigs: config array
   @param params.previousPromise: promise on which next then handler will be attached.
   @param params.index index on which update function will be called
 */
const callUpdateFunc = ({
  globalResolve,
  globalReject,
  numOfUpdates,
  updaterResponse,
  updateParams,
  updateConfigs,
  previousPromise,
  index
}) => {
  const isLastUpdate = (numOfUpdates - 1) === index;
  previousPromise.then(() => {
    const {promise, resolve, reject} = isLastUpdate ? {} : createPromise();
    const {funcToExec, params} = updateConfigs[index].transaction;
    const funcPromise = _.isFunction(funcToExec) ? funcToExec(params, updateParams, setNextUpdateParams(updateParams)) : Promise.resolve();
    if (isLastUpdate) {
      return funcPromise.then(globalResolve, throwErrorOnRejection);
    } else {
      funcPromise.then(setUpdateResponse(updaterResponse, index, resolve), throwErrorOnRejection);
    }
    return callUpdateFunc({globalResolve, globalReject, numOfUpdates, updaterResponse, updateParams, updateConfigs, previousPromise: promise, index: index + 1});
  }).catch(revertUpdate({updateConfigs, updaterResponse, revertFromIndex: index, globalReject}));
}

/**
 * function is called for reverting updates
 * @param {Object} params
   @param params.globalReject: called after reverting all the updates
   @param params.updaterResponse: update responses array.
   @param params.previousPromise: promise on which next then handler will be attached.
   @param params.index: index to revert
 */
const callRevertFunc = ({
  globalReject,
  updaterResponse,
  updateConfigs,
  previousPromise,
  index
}) => {
  previousPromise.then(() => {
    const {promise, resolve, reject} = (index === 0) ? {} : createPromise();
    const {funcToExec, params} = updateConfigs[index].rollback;
    const funcPromise = _.isFunction(funcToExec) ? funcToExec(params, updaterResponse[index]) : Promise.resolve();
    funcPromise.then(resolve, reject);

    return (index === 0) ? funcPromise.then(globalReject, throwErrorOnRejection) :
      callRevertFunc({
        globalReject,
        updaterResponse,
        updateConfigs,
        previousPromise: promise,
        index: index - 1,
      })

  }).catch(globalReject);
}

/**
 * function is called when reverting update
 * @param {Object} params
   @param {Object[]} params.updateConfigs: contains the request config.
   @param {number} params.revertFromIndex: index upto which we need to reset state
   @param {callback} params.globalResolve: called when all the request are completed
   @param {callback} params.globalReject: called after reverting all the updates.
 */
const revertUpdate = ({
  updateConfigs,
  updaterResponse,
  revertFromIndex,
  globalReject
}) => () => {
  if (revertFromIndex <= 0) {
    globalReject();
    return;
  }
  console.log('Reverting from index', revertFromIndex - 1);
  callRevertFunc({
    globalReject,
    updaterResponse,
    updateConfigs,
    previousPromise: Promise.resolve(),
    index: revertFromIndex - 1
  });
}

/**
 * This function takes in config to executing request in series (on after other)
 * order depends on array.
 * @param {Object[]} updateConfigs: [
   @param {Object} updateConfigs[].transaction
   @param {Object} updateConfigs[].rollback
   @param {string} updateConfigs[].transaction.funcToExec: func to do a transaction should return promise
   @param {Object} updateConfigs[].transaction.params: payload to send while executing funcToExec

  [
    {
      transaction: {funcToExec: '', params:  {}},
      rollback: {funcToExec: '', params:  {}}
    },
    {
      transaction: {funcToExec: '', params:  {}},
      rollback: {funcToExec: '', params:  {}}
    }
  ]
 */

const asyncRollback = (updateConfigs) => {
  let updaterResponse = [];
  const {promise, resolve, reject} = createPromise();
  const numOfUpdates = updateConfigs.length;
  callUpdateFunc({
    globalResolve: resolve,
    globalReject: reject,
    numOfUpdates,
    updaterResponse,
    updateParams: {},
    updateConfigs,
    previousPromise: Promise.resolve(),
    index: 0
  });
  return promise;
}

module.exports = asyncRollback;
