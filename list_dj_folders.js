const fs = require('fs');
const path = require('path');

const djPath = '/Users/flowasitgoes/DJ';

// 读取 DJ 文件夹内容
fs.readdir(djPath, (err, files) => {
    if (err) {
        console.error('读取文件夹时出错:', err);
        return;
    }

    // 过滤出以 05 到 100 开头的文件夹
    const targetFolders = files.filter(file => {
        const stats = fs.statSync(path.join(djPath, file));
        return stats.isDirectory() && /^(0[5-9]|[1-9][0-9]|100)/.test(file);
    });

    // 按数字排序
    targetFolders.sort((a, b) => {
        const numA = parseInt(a.match(/^\d+/)[0]);
        const numB = parseInt(b.match(/^\d+/)[0]);
        return numA - numB;
    });

    console.log('找到以下文件夹：');
    targetFolders.forEach(folder => {
        console.log(`\n${folder}:`);
        const folderPath = path.join(djPath, folder);
        const folderContents = fs.readdirSync(folderPath);
        folderContents.forEach(file => {
            console.log(`  - ${file}`);
        });
    });
}); 