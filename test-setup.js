import chai from 'chai';
import sinon from 'sinon';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';

chai.should();
chai.use(dirtyChai);
chai.use(sinonChai);

global.sinon = sinon;
global.chai = chai;
global.expect = chai.expect;