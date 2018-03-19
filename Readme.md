# async-rollback

A simple util to make rollback easy in complex nested promises.

Every now and then we have a problem wherein db/micro service call depends on each other
For eg.

```javascript

function updateSomeDoc2() {
  return call() // call some async api/db call
}

function updateSomeDoc3() {
  return call() // call some async api/db call
}

updateSomeDoc1().then(updateSomeDoc2).then(updateSomeDoc3).catch(onError);
```
This seems fine but during db/ micro service calls we need to make sure whenever updateSomeDoc3 fails, updateSomeDoc2, updateSomeDoc1 should be reverted but their is only catch method onError which would only identify something wrong happened while executing either updateSomeDoc1, updateSomeDoc2, updateSomeDoc3. So to know error a particular method we would generally do is

```javascript

function onUpdateFailedDoc1() {
  throw Error('')
}

function onUpdateFailedDoc2() {
  onUpdateFailedDoc1(); // revert first doc function
  throw Error('')
}

function onUpdateFailedDoc3() {
  onUpdateFailedDoc2(); // revert second update
  onUpdateFailedDoc1(); // revert first update
  throw Error('')
}

function onError() {
}

updateSomeDoc1().then(updateSomeDoc2, onUpdateFailedDoc1).then(updateSomeDoc3, onUpdateFailedDoc2).then(onSuccess, onUpdateFailedDoc3).catch(onError);
```

This chaining increases as we go deeper in nesting hence most of the time it's difficult to write rollback methods. This library provides a much better readable api to solve this issue wherein each rollback method tries only to rollback it's transaction rather than rollbacking n-1 transactions above it.

Features

  - Can be used to nest multiple update/create call which depend on each other
  - Can be used to rollback update/create calls using update/delete call
  - transaction function can set what it needs to give child just like async waterfall
  - rollback receives own params and it's transaction response.

### Example
```sh
$ npm i
$ cd examples
$ node basic   // For basic nest calls
$ node rollback   // know how rollback happens
$ node rollbackWithTransaction // rollback using transaction response
```

### Installation
``npm install node-async-rollback --save``

### Usage
```javascript
import asyncRollback from 'node-async-rollback';

const updateObj = [
  {
    transaction: {funcToExec: () => Promise.resolve(), params: {} },
    rollback: {funcToExec: () => Promise.resolve(), params: {}}
  },
  {
    transaction: {funcToExec: () => Promise.reject(), params: {} },
    rollback: {funcToExec: () => Promise.resolve(), params: {}}
  }
];

asyncRollback(updateObj).then(onSuccess).catch(onError);
//...
```

### Contributing

If you'd like to see something added or changed to this module please open a new GitHub issue. Pull requests are always welcome.
