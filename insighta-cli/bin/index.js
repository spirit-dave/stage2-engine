#!/usr/bin/env node

const { Command } = require("commander")
const login = require("../src/commands/login")
const getProfiles = require("../src/commands/profiles")

const program = new Command()

program
  .command("login")
  .description("Login to Insighta")
  .action(login)

program
  .command("profiles")
  .description("Fetch profiles")
  .action(getProfiles)

program.parse(process.argv)