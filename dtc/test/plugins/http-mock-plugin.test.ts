import {test} from 'node:test'
import {arrange, assert} from '../../src/plugins/http-mock-plugin'

test('It does not arrange if type does not match', () => arrange({}))

test('It does not assert if type does not match', () => assert())
