const fs = require('fs');
const express = require('express');
const axios = require('axios');
const session = require('express-session');
const chokidar = require('chokidar');

//类CF简单反向代理
//请求示例：http://127.0.0.1:8082/?url=https://www.baidu.com

// 初始化应用
const app = express();

// 全局配置变量
let config = {};

// 加载配置文件
function loadConfig() {
  try {
    const rawData = fs.readFileSync('./config.json', 'utf8');
    config = JSON.parse(rawData);
    console.log('配置已更新:', config);
  } catch (err) {
    console.error('配置文件加载失败:', err.message);
  }
}

loadConfig();

// 监听配置文件变化
chokidar.watch('./config.json', { persistent: true }).on('change', () => {
  console.log('检测到配置文件更改，重新加载...');
  loadConfig();
});

// 使用 express-session 中间件来管理每个用户的会话
app.use(session({
  secret: config.secret,  // 自定义密钥
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS 时需设置为 true
}));

// 工具函数：验证 URL 是否有效
function isValidUrl(url) {
  const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i; // 更严格的 URL 检查
  return urlRegex.test(url);
}

// 工具函数：检查是否是黑名单域名
function isBlacklisted(url) {
  if (!config.blacklist || !Array.isArray(config.blacklist)) return false;
  const blacklistRegex = new RegExp(config.blacklist.join('|'), 'i'); // 动态构建正则
  return blacklistRegex.test(url);
}

// 工具函数：生成目标 URL
function getTargetUrl(baseUrl, path) {
  if (!baseUrl) return '';
  const normalizedPath = path.replace(/^\//, ''); // 去掉路径前的斜杠
  return normalizedPath ? `${baseUrl}/${normalizedPath}` : `${baseUrl}`;
}

// 限制允许的 HTTP 方法
app.all('*', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    return res.status(405).send('只允许发送GET和OPTIONS请求！');
  }
  res.setHeader('Access-Control-Allow-Origin','*');//允许跨域请求
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');//允许跨域请求方法
  res.setHeader('Access-Control-Allow-Headers','');//自定义请求头
  next();
});

// 代理处理逻辑
app.get('/*', (req, res) => {
  try {
    //访问首页
    if(req.path === '/proxy.html'){
      res.setHeader('Content-Type','text/html');
      return  res.sendFile(__dirname+'/proxy.html');
    }else if(req.path === '/proxy2.html'){
      res.setHeader('Content-Type','text/html');
      return  res.sendFile(__dirname+'/proxy2.html');
    }

    const length = Object.keys(req.query).length;
    let reqUrl = '';

    if (length == 1) {
                //单一参数，客户端发送简单URL或进行URL编码
 	reqUrl = req.query.url || '';
 } else if (length > 1 && req.url.indexOf('?url=')) {
                 //很多参数，客户端未进行URL编码
 	reqUrl = req.url.substring(req.url.indexOf('?url=') + 5);
 }

    const userAgent = req.headers['user-agent'] || '';

    // URL 验证
    if (reqUrl && !isValidUrl(reqUrl)) {
      console.warn('Invalid URL detected:', reqUrl);
      return res.status(400).send('URL参数值格式有误！');
    }

    // 黑名单检测
    if (reqUrl && isBlacklisted(reqUrl)) {
      console.error(`${req.ip}用户访问黑名单域名：`, reqUrl);
      return res.status(403).send('访问的域名在黑名单中，禁止访问！');
    }

    // 更新会话的 URL 参数
    if (reqUrl) {
      req.session.url = reqUrl;
    }

    const baseUrl = req.session.url || '';
    if (!baseUrl) {
      return res.status(400).send('会话中并未发现URL参数，3秒后自动跳转首页！<script>setTimeout(()=>{location.href="/proxy.html"},3000);</script>');
    }

    // 拼接目标 URL
    const targetUrl = getTargetUrl(baseUrl, req.path);
    if (!isValidUrl(targetUrl)) {
      console.warn('Generated target URL is invalid:', targetUrl);
      return res.status(400).send('拼接后的URL格式有误！');
    }

     console.info(`${req.ip}用户请求访问了${targetUrl}网站！`);

    // 构建请求头
    const headers = req.headers;
    headers['referer'] = (new URL(baseUrl)).origin;
    headers['host'] = (new URL(targetUrl)).host;
    headers['user-agent'] = userAgent;
   
     // 发送代理请求
 axios.get(targetUrl, {
  headers,
  responseType: 'stream' // 默认使用流式响应
})
  .then(response => {
    const contentType = response.headers['content-type'];
    console.log(`响应头内容: ${contentType}`);
    
    // 设置响应头
    res.setHeader('Content-Type', contentType);

    // 判断资源类型
    if (contentType && /^(text\/html|text\/css|application\/javascript|application\/json|font\/|image\/svg\+xml)/i.test(contentType)) {
      // 一次性加载的小资源
      let data = '';
      response.data.on('data', chunk => {
        data += chunk;
      });
      response.data.on('end', () => {
        res.send(data);
      });
    } else if (contentType && /^(audio|video|image|application\/octet-stream)/i.test(contentType)) {
      // 流式加载的大资源
      response.data.pipe(res);
    } else {
      // 默认处理
      response.data.pipe(res);
    }
  })
  .catch(error => {
    console.error('Error fetching target URL:', error.message);
    res.status(500).send(error.message);
  });

  } catch (err) {
    console.error('Unhandled error:', err.message);
    res.status(500).send(err.message);
  }
});

// 启动服务
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
