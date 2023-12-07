#!/usr/bin/env node

import 'dotenv/config'
import program from 'commander'

import {record} from './index'

program
    .version('0.1.0')
    .option('-u, --url [url]', 'Provide github public URL', null)
    .option('-b, --branch [name]', 'Provide github public URL', null)
    .parse(process.argv)

record({
    gitUrl: program.url,
    branch: program.branch
}).then(result => console.log(result.message))
