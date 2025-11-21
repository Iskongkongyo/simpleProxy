# simpleProxy

## 一、项目介绍 🚀

**simpleProxy** 是一个基于 **Node.js** 的轻量级反向代理工具。 它支持代理 **文档、音视频、图片、文本等内容**，并且可以用于解决 **CORS（跨域资源共享）问题**。

主要功能：

- 🔄 反向代理多种资源类型（文档、音视频、图片、文本等）
- 🛡️ 支持域名黑名单，限制访问指定域名及其子域名
- 🔑 支持秘钥配置，增强安全性
- ⚡ 实时监听配置文件变化（无需重启即可生效，端口除外）

## 二、安装与运行 ⚙️

### 1. 环境准备

确保已安装 **Node.js** 和 **npm/cnpm**：

```
node -v   # 查看 Node.js 版本
npm -v    # 查看 npm 版本
```

### 2. 安装依赖

在项目目录下执行：

```
npm install   # 或者 cnpm install
```

### 3. 设置权限

为核心文件添加可读权限：

```
chmod +x index.js 
chmod +x config.json
```

### 4. 启动项目

```
node index.js
# 或者
npm start / cnpm start
```

⚠️ **注意事项**：

- 默认运行端口为 **8082**
- 如果该端口被占用，项目将无法正常运行

## 三、后台运行 🖥️

如果直接关闭终端，项目会停止运行。为了保持后台运行，可以使用 **screen** 工具。

### 安装 screen（Ubuntu/Debian 示例）

```
sudo apt update
sudo apt install screen
```

### 创建后台会话并运行项目

```
screen -S proxy   # 创建名为 proxy 的会话
cd ~/proxy && node index.js   # 进入会话并运行项目
```

### 管理会话

- **退出会话但保持运行**：`Ctrl + A + D`
- **查看会话列表**：`screen -ls`
- **重新进入会话**：`screen -r proxy`

## 四、配置文件说明 📝

配置文件：`config.json`   项目使用 **chokidar** 模块实时监听文件变化，修改配置后（除端口外）无需重启即可生效。

### 配置项示例

```
{
  "port": 8082,
  "secret": "your-secret-key",
  "blacklist": ["example.com", "sub.example.com"]
}
```

### 字段说明

- **port**：项目运行端口号（修改需重启）
- **secret**：秘钥内容，用于安全校验
- **blacklist**：域名黑名单，禁止访问该域名及其子域名

## 五、项目访问 🌐

### 1. Web 页面

- http://127.0.0.1:8082/proxy.html
- http://127.0.0.1:8082/proxy2.html

### 2. API 接口

```
http://127.0.0.1:8082/?url=代理目标URL
```

👉 建议对代理的 URL 进行 **URL 编码**：

```
encodeURIComponent('代理URL')
```

示例：

```
http://127.0.0.1:8082/?url=https%3A%2F%2Fexample.com%2Fapi%2Fdata
```
