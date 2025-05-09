const fs = require('fs');
const path = require('path');

const djPath = '/Users/flowasitgoes/DJ';

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

    console.log('检查标题中的特殊字符：\n');

    // 处理每个文件夹
    targetFolders.forEach(folder => {
        const folderPath = path.join(djPath, folder);
        const folderContents = fs.readdirSync(folderPath);
        
        // 查找 set_info 文件
        const setInfoFile = folderContents.find(file => file.startsWith('set_info_'));
        if (setInfoFile) {
            const setInfoPath = path.join(folderPath, setInfoFile);
            const setInfoContent = fs.readFileSync(setInfoPath, 'utf8');
            
            // 获取标题（第一行）
            const title = setInfoContent.split('\n')[0];
            const cleanedTitle = cleanText(title);

            // 如果清理后的标题与原标题不同，显示差异
            if (title !== cleanedTitle) {
                console.log(`\n文件夹 ${folder}:`);
                console.log('原始标题:', title);
                console.log('清理后标题:', cleanedTitle);
                console.log('差异字符:');
                
                // 显示每个字符的编码
                for (let i = 0; i < title.length; i++) {
                    if (title[i] !== cleanedTitle[i]) {
                        console.log(`位置 ${i}: '${title[i]}' (${title.charCodeAt(i)}) -> '${cleanedTitle[i]}' (${cleanedTitle.charCodeAt(i)})`);
                    }
                }
                console.log('----------------------------------------');
            }
        }
    });
}); 