import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FLIPRIS - Job Search API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 800px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        h1 {
            color: #333;
            font-size: 3em;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            color: #666;
            font-size: 1.2em;
            margin-bottom: 40px;
        }
        .features {
            text-align: left;
            margin: 40px 0;
            display: grid;
            gap: 15px;
        }
        .feature {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .feature strong {
            color: #667eea;
        }
        .endpoints {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            margin-top: 30px;
        }
        .endpoints h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .endpoint-list {
            text-align: left;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .endpoint-item {
            padding: 8px;
            margin: 5px 0;
            background: white;
            border-radius: 5px;
        }
        a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        a:hover {
            text-decoration: underline;
        }
        .status {
            display: inline-block;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-weight: 600;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 FLIPRIS</h1>
        <p class="subtitle">Advanced Job Search System API</p>
        <div class="status">✓ API is running</div>
        
        <div class="features">
            <div class="feature">
                <strong>🔐 Authentication:</strong> JWT-based auth with email & OTP verification
            </div>
            <div class="feature">
                <strong>🏢 Company Management:</strong> Full CRUD for companies with media uploads
            </div>
            <div class="feature">
                <strong>💼 Job System:</strong> Advanced job posting and application tracking
            </div>
            <div class="feature">
                <strong>💬 Real-time Chat:</strong> Instant messaging powered by Socket.IO
            </div>
            <div class="feature">
                <strong>📊 Admin Dashboard:</strong> GraphQL-powered analytics and management
            </div>
        </div>

        <div class="endpoints">
            <h2>📡 Available Endpoints</h2>
            <div class="endpoint-list">
                <div class="endpoint-item">🔌 REST API: <strong>/auth</strong>, <strong>/user</strong>, <strong>/company</strong>, <strong>/jobs</strong></div>
                <div class="endpoint-item">📊 GraphQL Playground: <a href="/graphql">/graphql</a></div>
                <div class="endpoint-item">📚 Postman Collection: Available in repository</div>
            </div>
        </div>

        <p style="margin-top: 30px; color: #666;">
            Powered by <strong>NestJS</strong> • Deployed on <strong>Vercel</strong>
        </p>
    </div>

    <script type="module">
        import { injectSpeedInsights } from 'https://cdn.jsdelivr.net/npm/@vercel/speed-insights@2.0.0/dist/index.mjs';
        injectSpeedInsights();
    </script>
</body>
</html>
    `;
  }
}
