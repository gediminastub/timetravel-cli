# A VERY POC of CodeTimeTravel tool for educators to record rewindable project state making it easier for students to go back, copy,
# play around, and hopefully have less course drop-outs along the way  

### UI URL:
### UI URL:

## Usage

## run "yarn", then
## yarn dev -u https://github.com/gediminastub/timetravel-files -b test1
## -u GitHub public repo URL
## -b repo branch
## +create a .env file from "env_example" and add Your GitHub token (should have "content" rights as "write") to GITHUB_TOKEN variable 

### **dev**

`npm run dev`

Runs the CLI application.

You can pass arguments to your application by running `npm run dev -- --your-argument`. The extra `--` is so that your arguments are passed to your CLI application, and not `npm`.

### **clean**

`npm run clean`

Removes any built code and any built executables.

### **build**

`npm run build`

Cleans, then builds the TypeScript code.

Your built code will be in the `./dist/` directory.

### **test**

`npm run test`

Cleans, then builds, and tests the built code.

### **bundle**

`npm run bundle`

Cleans, then builds, then bundles into native executables for Windows, Mac, and Linux.

Your shareable executables will be in the `./exec/` directory.
