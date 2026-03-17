# 🚀 Vercel 部署指南

## 快速部署飞书表格解析服务到云端

通过本指南，您可以将飞书表格解析功能部署到 Vercel，让在线网站也能自动解析飞书表格。

---

## 📋 前置准备

1. **GitHub 账号**（已有）
2. **Vercel 账号**（免费注册）
3. **5分钟时间**

---

## 🎯 部署步骤

### 第一步：注册 Vercel 账号

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 **"Sign Up"**
3. 选择 **"Continue with GitHub"**（使用GitHub登录）
4. 授权 Vercel 访问您的 GitHub 账号

### 第二步：导入 GitHub 项目

1. 登录 Vercel 后，点击 **"Add New..."** → **"Project"**

2. 在项目列表中找到 **`zhongtong`** 仓库
   - 如果没有看到，点击 **"Adjust GitHub App Permissions"** 授权

3. 点击仓库右侧的 **"Import"** 按钮

### 第三步：配置项目

保持默认配置即可：

```
Framework Preset: Other
Root Directory: ./
Build Command: (留空)
Output Directory: ./
Install Command: (留空)
```

点击 **"Deploy"** 按钮开始部署。

### 第四步：等待部署完成

- 部署过程约 **1-2 分钟**
- 看到 **"🎉 Congratulations!"** 表示部署成功
- 记录下您的网站地址，例如：
  ```
  https://zhongtong-xxxxx.vercel.app
  ```

### 第五步：测试功能

1. 访问您的 Vercel 网站地址
2. 在"当前指标缺口"区域，输入飞书表格链接
3. 点击"🚀 导入飞书表格"
4. 等待2-5秒，看到"✅ 飞书表格导入成功！"

**恭喜！部署完成！** 🎉

---

## 🔧 高级配置（可选）

### 启用真实的飞书API解析

当前使用模拟数据，如需使用真实飞书API：

#### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn)
2. 创建企业自建应用
3. 记录 **App ID** 和 **App Secret**
4. 在"权限管理"中开通：
   - 查看、编辑多维表格
   - 查看多维表格

#### 2. 配置 Vercel 环境变量

1. 在 Vercel 项目页面，点击 **"Settings"**
2. 选择 **"Environment Variables"**
3. 添加以下变量：

   | Name | Value |
   |------|-------|
   | `FEISHU_APP_ID` | 您的 App ID |
   | `FEISHU_APP_SECRET` | 您的 App Secret |

4. 点击 **"Save"**

#### 3. 修改代码启用真实API

编辑 `api/parse-feishu.js` 文件：

```javascript
// 找到这段代码（约第36行）
async function parseFeishuTable(feishuUrl) {
    // 注释掉模拟数据
    // return getMockData();

    // 启用真实API
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error('未配置飞书应用凭证');
    }

    return await parseFeishuTableReal(feishuUrl, appId, appSecret);
}
```

提交并推送代码，Vercel 会自动重新部署。

---

## 🌐 自定义域名（可选）

### 绑定自己的域名

1. 在 Vercel 项目页面，点击 **"Settings"** → **"Domains"**
2. 输入您的域名，例如：`zhongtong.yourdomain.com`
3. 按照提示添加 DNS 记录
4. 等待 DNS 生效（通常5-10分钟）

---

## ✅ 验证部署

### 测试清单：

- [ ] 网站可以正常访问
- [ ] 飞书表格输入框显示正常
- [ ] 点击导入按钮显示加载动画
- [ ] 显示"✅ 飞书表格导入成功！"
- [ ] 数据正确导入到表格中

---

## 🐛 故障排除

### 问题1：部署失败

**可能原因：** GitHub 仓库未同步

**解决方法：**
```bash
cd Desktop/zhongtong
git pull origin main
git push origin main
```

### 问题2：API 无法连接

**可能原因：** Vercel 函数未正确部署

**解决方法：**
1. 检查 `api/parse-feishu.js` 文件是否存在
2. 检查 `vercel.json` 配置是否正确
3. 在 Vercel 中查看部署日志

### 问题3：飞书API返回错误

**可能原因：** 环境变量未配置或权限不足

**解决方法：**
1. 检查 Vercel 环境变量是否正确设置
2. 检查飞书应用权限是否开通
3. 查看 Vercel 函数日志（Functions → Logs）

---

## 📊 对比：部署前后

| 功能 | 部署前 | 部署后 |
|------|--------|--------|
| 在线访问 | ✅ | ✅ |
| 自动解析飞书 | ❌ | ✅ |
| 需要本地服务器 | ✅ | ❌ |
| 随时随地使用 | ❌ | ✅ |
| HTTPS安全连接 | ❌ | ✅ |

---

## 🎉 完成！

现在您的在线网站已经支持自动解析飞书表格了！

- 🌐 **在线网站**：https://your-project.vercel.app
- 📱 **随时访问**：手机、电脑都能用
- 🚀 **自动解析**：输入链接，一键导入
- 🔒 **安全可靠**：HTTPS + Serverless

---

## 📞 需要帮助？

遇到问题可以：
1. 查看 Vercel 部署日志
2. 检查浏览器控制台错误
3. 参考 README-FEISHU.md 文档

---

**部署时间：** 约5分钟
**成本：** 完全免费（Vercel 免费额度足够使用）
**更新频率：** 每次推送代码到 GitHub 自动部署
