#!/usr/bin/env node

import program from 'commander'

import {record} from './index'

program
    .version('0.1.0')
    .option('-u, --url [type]', 'Provide github public URL', null)
    .parse(process.argv)

record({
    gitUrl: program.url
}).then(result => console.log(result.message))
