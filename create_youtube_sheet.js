const fs = require('fs');
const path = require('path');
const csv = require('csv-writer').createObjectCsvWriter;

const djPath = '/Users/flowasitgoes/DJ';
const outputPath = 'youtube_sheet.csv';

// 清理文本的函数
function cleanText(text) {
    if (!text) return '';
    
    return text
        // 移除控制字符
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // 替换各种省略号为标准省略号
        .replace(/…|\.{3,}/g, '...')
        // 替换特殊空格为标准空格
        .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000\uFEFF]/g, ' ')
        // 替换其他可能导致问题的特殊字符
        .replace(/[⌇]/g, '|')
        .replace(/[･]/g, '.')
        .replace(/[ﾟ]/g, '°')
        .trim();
}

// 创建 CSV writer
const csvWriter = csv({
    path: outputPath,
    header: [
        {id: 'id', title: 'ID'},
        {id: 'status', title: 'Status'},
        {id: 'videoFileName', title: 'Video File Name'},
        {id: 'videoFileLink', title: 'Video File Link'},
        {id: 'title', title: 'Title'},
        {id: 'description', title: 'Description'},
        {id: 'tags', title: 'Tags'},
        {id: 'thumbnailFileLink', title: 'Thumbnail File Link'}
    ]
});

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

    const records = [];

    // 处理每个文件夹
    targetFolders.forEach((folder, index) => {
        const folderPath = path.join(djPath, folder);
        const folderContents = fs.readdirSync(folderPath);
        
        // 查找所需文件
        const setInfoFile = folderContents.find(file => file.startsWith('set_info_'));
        const tagsFile = folderContents.find(file => file.startsWith('tagsForSet_'));
        const videoFile = folderContents.find(file => file.endsWith('.mov'));
        const thumbnailFile = folderContents.find(file => file.endsWith('.jpg') || file.endsWith('.png'));

        if (setInfoFile) {
            // 读取 set_info 文件内容
            const setInfoPath = path.join(folderPath, setInfoFile);
            const setInfoContent = fs.readFileSync(setInfoPath, 'utf8');
            
            // 读取标签文件内容
            let tags = '';
            if (tagsFile) {
                const tagsPath = path.join(folderPath, tagsFile);
                tags = fs.readFileSync(tagsPath, 'utf8').trim();
            }

            // 解析 set_info 内容
            const lines = setInfoContent.split('\n');
            const title = cleanText(lines[0] || '');
            const description = cleanText(lines.slice(1).join('\n'));

            // 获取文件夹编号
            const folderNumber = folder.match(/^(\d+)/)[1];

            records.push({
                id: folderNumber,
                status: 'waiting',
                videoFileName: videoFile || '',
                videoFileLink: '',  // 需要后续添加
                title: title,
                description: description,
                tags: cleanText(tags),
                thumbnailFileLink: thumbnailFile || ''
            });
        }
    });

    // 写入 CSV 文件
    csvWriter.writeRecords(records)
        .then(() => {
            console.log('CSV 文件已成功创建！');
            console.log(`共处理了 ${records.length} 个文件夹`);
        })
        .catch(err => {
            console.error('创建 CSV 文件时出错:', err);
        });
}); 