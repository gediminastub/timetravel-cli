import test from 'ava'

import {record} from './index'

test.before(async t => {
    console.log('Starting tests!')
})

test('can order a pizza', async t => {

    let result = await record({
        gitUrl: 'swiss'
    })

    t.true(result.message.includes('you ordered a pizza'))
    t.true(result.message.includes('swiss'))

})
