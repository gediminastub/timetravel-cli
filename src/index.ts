import * as fs from "fs";
import * as fse from "fs-extra";
import git from "isomorphic-git";
import http from 'isomorphic-git/http/node';
import path from "path";

export interface Params {
    gitUrl: string,
    branch: string
}

const copyDirectories = (source, destination) => {
    fs.readdirSync(source, {withFileTypes: true}).filter(
        (entry) => {
            const fullsrc = path.resolve(source + path.sep + entry.name);
            const fulldest = path.resolve(destination + path.sep + entry.name);
            if (entry.name == '.git' || entry.name == 'node_modules' || entry.name == 'dist' || entry.name == '.idea' || entry.name == 'src') {
                return true;
            }
            if (entry.isDirectory && fullsrc !== destination)
                fse.copySync(fullsrc, fulldest);
            else if (!entry.isDirectory)
                fs.copyFileSync(fullsrc, fulldest);
            return true;
        }
    );
    return true;
}

const deleteAllExcept = (dir: string, fileNames: string[]) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fileDir = path.join(dir, file);

        if (!fileNames.includes(file)) {
            try {
                fs.rmSync(fileDir, {recursive: true, force: true});
            } catch (e) {
            }
        }
    });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pushChanges = async (dir: string, branch: string, time: Date) => {
    deleteAllExcept(dir, ['.git', '.gitignore', '.idea']);
    copyDirectories(path.join(process.cwd()), dir)

    const repo = {
        fs,
        dir,
        ref: branch,
    };

    await git.statusMatrix(repo).then((status) =>
        Promise.all(
            status.map(([filepath, , worktreeStatus]) =>
                worktreeStatus ? git.add({...repo, filepath}) : git.remove({...repo, filepath})
            )
        ));


    const commitResp = await git.commit({
        fs,
        dir,
        ref: `refs/heads/${branch}`,
        author: {
            name: 'Gediminas Tubelevicius',
            email: 'gtubelevicius@gmail.com',
        },
        message: `CodeTimeTravel ${time.getHours()}:${time.getMinutes()}`
    })

    console.log(commitResp)

    const pushResp = await git.push({
        fs,
        http,
        dir,
        force: true,
        remote: 'origin',
        ref: branch,
        onAuth: () => ({username: process.env.GITHUB_TOKEN}),
    })

    console.log('pushResp.ok', pushResp);
}

export async function record(params: Params): Promise<{ message: string }> {
    const dir = path.join(process.cwd(), 'test-clone')
    const url = params.gitUrl;
    const branch = params.branch;

    await git.clone({
        fs,
        http,
        dir,
        url,
    });

    //TODO unsafe, fix
    await git.branch({
        fs,
        dir,
        checkout: true,
        force: true,
        ref: branch
    })

    //TODO if branch exists - just checkout. Add options to not override branch
    //
    // await git.checkout({
    //     fs,
    //     dir,
    //     ref: branch
    // })

    const time = new Date(0, 0, 0, 0, 0, 0, 0);

    while (true) {
        console.log('PING', time.getMinutes());
        await pushChanges(dir, branch, time);
        console.log('Pushed');
        await sleep(5000)
        time.setMinutes(time.getMinutes() + 1);
    }
}
