#!/usr/bin/env python3
"""
飞书表格解析工具
使用MCP doc-parser解析飞书表格并生成Excel文件
"""

import json
import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import subprocess

class FeishuParserHandler(BaseHTTPRequestHandler):
    """处理飞书表格解析请求"""

    def do_OPTIONS(self):
        """处理CORS预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """处理POST请求"""
        if self.path == '/parse-feishu':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                # 解析请求数据
                data = json.loads(post_data.decode('utf-8'))
                feishu_url = data.get('url', '')

                if not feishu_url:
                    self.send_error_response(400, '缺少URL参数')
                    return

                print(f'正在解析飞书表格: {feishu_url}')

                # 调用MCP doc-parser解析飞书表格
                table_data = self.parse_feishu_with_mcp(feishu_url)

                # 返回成功响应
                self.send_json_response(200, {
                    'success': True,
                    'tableData': table_data
                })

                print(f'解析完成，返回 {len(table_data)} 行数据')

            except Exception as e:
                print(f'解析错误: {str(e)}')
                self.send_error_response(500, str(e))
        else:
            self.send_error_response(404, '路径不存在')

    def parse_feishu_with_mcp(self, feishu_url):
        """
        使用MCP doc-parser解析飞书表格

        注意：这个函数需要Claude环境来调用MCP工具
        在标准Python环境中，这将返回模拟数据
        """

        # 由于MCP工具只能在Claude环境中调用，
        # 这里提供两种实现方式：

        # 方式1：如果在Claude环境中运行（通过Claude Code CLI）
        # 可以直接调用MCP工具

        # 方式2：在标准Python环境中，返回模拟数据
        # 实际使用时，建议用户手动导出飞书表格为Excel

        print('提示：MCP doc-parser工具需要在Claude环境中运行')
        print('当前返回模拟数据，实际使用时请手动导出飞书表格')

        # 模拟数据
        mock_data = [
            ['车型', '指标类型', '2026 Q1', '2026 Q2', '2026 Q3', '2026 Q4'],
            ['X01', '量纲', 100, 120, 150, 130],
            ['X01', '单车维度缺口', 500.5, 600.8, 700.2, 650.3],
            ['X02', '量纲', 80, 90, 100, 95],
            ['X02', '单车维度缺口', 400.0, 450.5, 500.8, 480.2],
            ['X03', '量纲', 150, 160, 180, 170],
            ['X03', '单车维度缺口', 800.0, 850.5, 900.3, 870.8]
        ]

        # 模拟网络延迟
        time.sleep(1)

        return mock_data

    def send_json_response(self, status_code, data):
        """发送JSON响应"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_error_response(self, status_code, message):
        """发送错误响应"""
        self.send_json_response(status_code, {'error': message})

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def start_server(port=3000):
    """启动HTTP服务器"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, FeishuParserHandler)

    print("""
    ╔═══════════════════════════════════════════╗
    ║   飞书表格解析服务器已启动                ║
    ║                                           ║
    ║   地址: http://localhost:{:<4}           ║
    ║   路径: POST /parse-feishu                ║
    ║                                           ║
    ║   使用说明：                              ║
    ║   1. 在浏览器中打开 index.html            ║
    ║   2. 在"当前指标缺口"区域输入飞书链接      ║
    ║   3. 点击"导入飞书表格"按钮               ║
    ║                                           ║
    ║   注意：                                  ║
    ║   - 当前使用模拟数据                      ║
    ║   - 真实解析需要MCP doc-parser工具        ║
    ║   - 建议手动导出飞书表格为Excel           ║
    ║                                           ║
    ║   按 Ctrl+C 停止服务器                    ║
    ╚═══════════════════════════════════════════╝
    """.format(port))

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n正在关闭服务器...')
        httpd.shutdown()
        print('服务器已关闭')


if __name__ == '__main__':
    port = 3000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f'无效的端口号: {sys.argv[1]}，使用默认端口 3000')

    start_server(port)
