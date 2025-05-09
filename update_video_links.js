const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// 读取链接文件
const linkContent = fs.readFileSync('link.txt', 'utf8');
const lines = linkContent.split('\n');

// 创建链接映射
const linkMap = new Map();
for (let i = 0; i < lines.length; i += 3) {
    if (lines[i] && lines[i + 1]) {
        const fileName = lines[i].trim();
        const link = lines[i + 1].trim();
        const id = fileName.split('_')[0];
        linkMap.set(id, link);
    }
}

// 创建 CSV writer
const csvWriter = createCsvWriter({
    path: 'youtube_sheet_with_links.csv',
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

// 读取现有的 CSV 文件
const records = [];
fs.createReadStream('youtube_sheet.csv')
    .pipe(csv())
    .on('data', (row) => {
        // 创建新的记录对象
        const record = {
            id: row.ID || '',
            status: row.Status || '',
            videoFileName: row['Video File Name'] || '',
            videoFileLink: linkMap.get(row.ID) || '',
            title: row.Title || '',
            description: row.Description || '',
            tags: row.Tags || '',
            thumbnailFileLink: row['Thumbnail File Link'] || ''
        };
        records.push(record);
    })
    .on('end', () => {
        // 写入新的 CSV 文件
        csvWriter.writeRecords(records)
            .then(() => {
                console.log('已成功更新视频链接！');
                console.log(`共处理了 ${records.length} 条记录`);
            })
            .catch(err => {
                console.error('写入 CSV 文件时出错:', err);
            });
    }); 