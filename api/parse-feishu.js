/**
 * Vercel Serverless Function
 * 用于解析飞书表格
 */

module.exports = async (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只接受 POST 请求
    if (req.method !== 'POST') {
        res.status(405).json({ error: '只支持 POST 请求' });
        return;
    }

    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ error: '缺少 URL 参数' });
            return;
        }

        console.log('正在解析飞书表格:', url);

        // 解析飞书表格
        const tableData = await parseFeishuTable(url);

        res.status(200).json({
            success: true,
            tableData: tableData
        });

    } catch (error) {
        console.error('解析错误:', error);
        res.status(500).json({
            error: error.message || '服务器内部错误'
        });
    }
};

/**
 * 解析飞书表格（当前返回模拟数据）
 *
 * 要启用真实解析，需要：
 * 1. 配置飞书应用的 app_id 和 app_secret（在 Vercel 环境变量中）
 * 2. 使用下面的 parseFeishuTableReal 函数
 */
async function parseFeishuTable(feishuUrl) {
    // 方式1: 使用模拟数据（当前）
    return getMockData();

    // 方式2: 使用真实飞书API（需要配置环境变量）
    // const appId = process.env.FEISHU_APP_ID;
    // const appSecret = process.env.FEISHU_APP_SECRET;
    //
    // if (!appId || !appSecret) {
    //     throw new Error('未配置飞书应用凭证，请在 Vercel 中设置环境变量');
    // }
    //
    // return await parseFeishuTableReal(feishuUrl, appId, appSecret);
}

/**
 * 返回模拟数据（用于演示）
 */
function getMockData() {
    return [
        ['车型', '指标类型', '2026 Q1', '2026 Q2', '2026 Q3', '2026 Q4'],
        ['X01', '量纲', 100, 120, 150, 130],
        ['X01', '单车维度缺口', 500.5, 600.8, 700.2, 650.3],
        ['X02', '量纲', 80, 90, 100, 95],
        ['X02', '单车维度缺口', 400.0, 450.5, 500.8, 480.2],
        ['X03', '量纲', 150, 160, 180, 170],
        ['X03', '单车维度缺口', 800.0, 850.5, 900.3, 870.8],
        ['X04', '量纲', 120, 130, 140, 135],
        ['X04', '单车维度缺口', 600.0, 650.0, 700.0, 680.0],
        ['W01', '量纲', 200, 220, 250, 230],
        ['W01', '单车维度缺口', 1000.0, 1100.0, 1200.0, 1150.0],
        ['W02', '量纲', 90, 100, 110, 105],
        ['W02', '单车维度缺口', 450.0, 500.0, 550.0, 520.0],
        ['W04', '量纲', 110, 120, 130, 125],
        ['W04', '单车维度缺口', 550.0, 600.0, 650.0, 620.0],
        ['W05', '量纲', 130, 140, 160, 150],
        ['W05', '单车维度缺口', 650.0, 700.0, 800.0, 750.0]
    ];
}

/**
 * 使用飞书开放平台 API 真实解析表格
 * 需要配置环境变量：FEISHU_APP_ID 和 FEISHU_APP_SECRET
 */
async function parseFeishuTableReal(feishuUrl, appId, appSecret) {
    const https = require('https');

    // 1. 从URL中提取表格ID
    const tableIdMatch = feishuUrl.match(/\/base\/([^\/\?]+)/);
    if (!tableIdMatch) {
        throw new Error('无法从URL中提取表格ID');
    }
    const baseToken = tableIdMatch[1];

    // 2. 获取 tenant_access_token
    const tokenData = await new Promise((resolve, reject) => {
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

    if (tokenData.code !== 0) {
        throw new Error('获取飞书token失败: ' + tokenData.msg);
    }

    const accessToken = tokenData.tenant_access_token;

    // 3. 获取多维表格中的所有数据表
    const tablesData = await new Promise((resolve, reject) => {
        const options = {
            hostname: 'open.feishu.cn',
            path: `/open-apis/bitable/v1/apps/${baseToken}/tables`,
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

    if (tablesData.code !== 0) {
        throw new Error('获取数据表失败: ' + tablesData.msg);
    }

    // 4. 获取第一个数据表的记录
    const firstTableId = tablesData.data.items[0].table_id;

    const recordsData = await new Promise((resolve, reject) => {
        const options = {
            hostname: 'open.feishu.cn',
            path: `/open-apis/bitable/v1/apps/${baseToken}/tables/${firstTableId}/records?page_size=500`,
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

    if (recordsData.code !== 0) {
        throw new Error('获取记录失败: ' + recordsData.msg);
    }

    // 5. 转换为Excel格式的数组
    const records = recordsData.data.items;
    const result = [];

    // 添加表头（从第一条记录的字段中提取）
    if (records.length > 0) {
        const headers = Object.keys(records[0].fields);
        result.push(headers);

        // 添加数据行
        records.forEach(record => {
            const row = headers.map(header => record.fields[header] || '');
            result.push(row);
        });
    }

    return result;
}
