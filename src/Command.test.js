import test from 'ava'
import Command from './Command'

test('require name', t => {
  t.throws(() => new Command(), 'Expect command name to be a string.')
})

test('require description', t => {
  t.throws(() => new Command('foo'), 'Expect command to have a description.')
})
