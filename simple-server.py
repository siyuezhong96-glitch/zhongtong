#!/usr/bin/env python3
"""
Simple test server for feishu parser
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/parse-feishu':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            # Return mock data
            mock_data = [
                ['车型', '指标类型', '2026 Q1', '2026 Q2', '2026 Q3', '2026 Q4'],
                ['X01', '量纲', 100, 120, 150, 130],
                ['X01', '单车维度缺口', 500.5, 600.8, 700.2, 650.3],
                ['X02', '量纲', 80, 90, 100, 95],
                ['X02', '单车维度缺口', 400.0, 450.5, 500.8, 480.2]
            ]

            response = {
                'success': True,
                'tableData': mock_data
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

            print(f'✓ Request processed from {self.client_address[0]}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")

def start_server(port=3000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHandler)

    print('\n' + '='*50)
    print('   Feishu Parser Server Started!')
    print('='*50)
    print(f'\n   URL: http://localhost:{port}')
    print(f'   API: http://localhost:{port}/parse-feishu')
    print('\n   Press Ctrl+C to stop\n')
    print('='*50 + '\n')

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\nShutting down server...')
        httpd.shutdown()
        print('Server stopped.')

if __name__ == '__main__':
    start_server(3000)
