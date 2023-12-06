import * as fs from "fs";
import * as fse from "fs-extra";
import git from "isomorphic-git";
import http from 'isomorphic-git/http/node';
import path from "path";

export interface Params {
    gitUrl: string
}

const copyDirectories = (source, destination) => {
    fs.readdirSync(source,{withFileTypes: true}).filter(
        (entry) => {
            const fullsrc = path.resolve(source + path.sep + entry.name);
            const fulldest= path.resolve(destination + path.sep + entry.name);
            if (entry.name == '.git' || entry.name == 'node_modules' || entry.name == 'dist' || entry.name == '.idea' || entry.name == 'src') {
                return true;
            }
            if(entry.isDirectory && fullsrc !== destination)
                fse.copySync(fullsrc, fulldest);
            else if(!entry.isDirectory)
                fs.copyFileSync(fullsrc, fulldest);
            return true;
        }
    );
    return true;
}

const deleteAllExcept = (dir: string, fileName: string) => {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.log(err);
        }

        files.forEach(file => {
            console.log(file);
            const fileDir = path.join('./', file);

            if (file !== fileName) {
                fs.unlinkSync(fileDir);
            }
        });
    });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pushChanges = async (dir: string, branch: string, time: Date) => {
    // fs.cpSync(path.join(process.cwd()), dir, {recursive: true});
    deleteAllExcept(dir, '.git');
    copyDirectories(path.join(process.cwd()), dir)

    const repo = {
        fs,
        dir,
        ref: branch,
    };

    await git.statusMatrix(repo).then((status) =>
        Promise.all(
            status.map(([filepath, , worktreeStatus]) =>
                worktreeStatus ? git.add({ ...repo, filepath }) : git.remove({ ...repo, filepath })
            )
        ));


    const ats = await git.commit({
        fs,
        dir,
        author: {
            name: 'Gediminas Tubelevicius',
            email: 'gtubelevicius@gmail.com',
        },
        message: `CodeTimeTravel ${time.getHours()}:${time.getMinutes()}`
    })

    console.log('ats', ats);

    let pushResult = await git.push({
        fs,
        http,
        dir,
        remote: 'origin',
        ref: branch,
        onAuth: () => ({ username: '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' }),
        // onAuth: () => ({ username: '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' }),
    })
}

export async function record(params: Params): Promise<{ message: string }> {
    const dir = path.join(process.cwd(), 'test-clone')
    // const url = params.gitUrl;
    const url = 'https://github.com/gediminastub/timetravel-test';
    const branch = 'test';

    await git.clone({
        fs,
        http,
        dir,
        url: url,
    });

    // const files = await git.listFiles({ fs, dir, ref: branch });
    // for (const filepath of files) {
    //     await git.resetIndex({ fs, dir, filepath })
    // }

    await git.checkout({
        fs,
        dir,
        force: true,
        ref: branch
    })

    const time = new Date(0, 0, 0, 0, 0, 0, 0);

    while (true) {
        console.log('PING', time.getMinutes());
        await pushChanges(dir, branch, time);
        await sleep(5000)
        time.setMinutes(time.getMinutes() + 1);
    }
}
