/**
 * 飞书表格解析服务器
 * 用于解析飞书表格并返回数据给前端
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

const PORT = 3000;

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

/**
 * 使用MCP doc-parser工具解析飞书表格
 * 注意：这需要安装并配置MCP doc-parser
 */
async function parseFeishuTable(feishuUrl) {
    return new Promise((resolve, reject) => {
        // 这里需要调用MCP doc-parser工具
        // 由于MCP工具需要在Claude环境中运行，这里提供一个模拟实现

        // 实际实现：调用MCP doc-parser的submit和result函数
        // 1. 提交解析任务
        // 2. 等待解析完成
        // 3. 返回解析结果

        // 模拟返回数据（实际应该调用MCP工具）
        setTimeout(() => {
            // 模拟解析后的数据格式
            const mockData = [
                ['车型', '指标类型', '2026 Q1', '2026 Q2', '2026 Q3', '2026 Q4'],
                ['X01', '量纲', 100, 120, 150, 130],
                ['X01', '单车维度缺口', 500, 600, 700, 650],
                ['X02', '量纲', 80, 90, 100, 95],
                ['X02', '单车维度缺口', 400, 450, 500, 480]
            ];

            resolve(mockData);
        }, 2000);
    });
}

/**
 * 实际的飞书表格解析函数（使用飞书开放平台API）
 */
async function parseFeishuTableWithAPI(feishuUrl, appId, appSecret) {
    // 1. 从URL中提取表格ID
    const tableIdMatch = feishuUrl.match(/\/base\/([^\/\?]+)/);
    if (!tableIdMatch) {
        throw new Error('无法从URL中提取表格ID');
    }
    const tableId = tableIdMatch[1];

    // 2. 获取飞书access_token
    const tokenResponse = await new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            app_id: appId,
            app_secret: appSecret
        });

        const options = {
            hostname: 'open.feishu.cn',
            path: '/open-apis/auth/v3/tenant_access_token/internal',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });

    if (tokenResponse.code !== 0) {
        throw new Error('获取飞书token失败: ' + tokenResponse.msg);
    }

    const accessToken = tokenResponse.tenant_access_token;

    // 3. 读取表格数据
    const tableData = await new Promise((resolve, reject) => {
        const options = {
            hostname: 'open.feishu.cn',
            path: `/open-apis/bitable/v1/apps/${tableId}/tables`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });

    return tableData;
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // 只处理POST请求到/parse-feishu路径
    if (req.method === 'POST' && req.url === '/parse-feishu') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { url } = JSON.parse(body);

                if (!url) {
                    res.writeHead(400, corsHeaders);
                    res.end(JSON.stringify({ error: '缺少URL参数' }));
                    return;
                }

                console.log('正在解析飞书表格:', url);

                // 解析飞书表格
                const tableData = await parseFeishuTable(url);

                // 返回解析结果
                res.writeHead(200, corsHeaders);
                res.end(JSON.stringify({
                    success: true,
                    tableData: tableData
                }));

                console.log('解析完成，返回', tableData.length, '行数据');

            } catch (error) {
                console.error('解析错误:', error);
                res.writeHead(500, corsHeaders);
                res.end(JSON.stringify({
                    error: error.message || '服务器内部错误'
                }));
            }
        });

    } else {
        // 其他请求返回404
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({ error: '路径不存在' }));
    }
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║   飞书表格解析服务器已启动                ║
    ║                                           ║
    ║   地址: http://localhost:${PORT}         ║
    ║   路径: POST /parse-feishu                ║
    ║                                           ║
    ║   使用说明：                              ║
    ║   1. 确保HTML文件中的API地址指向本服务器  ║
    ║   2. 在HTML中输入飞书表格链接             ║
    ║   3. 点击"导入飞书表格"按钮               ║
    ║                                           ║
    ║   按 Ctrl+C 停止服务器                    ║
    ╚═══════════════════════════════════════════╝
    `);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
