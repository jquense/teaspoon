
chai.use(require('sinon-chai'))

const testsContext = require.context('./test', true, /.+/)

testsContext.keys().forEach(testsContext);
