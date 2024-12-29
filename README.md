# simpleProxy

## 一、介绍

简单使用Nodejs实现反向代理，可以反向代理诸如H5页面、音视频、图片、文本等内容，当然可以用来解决CORS问题。

## 二、安装

先确保环境安装Nodejs，通过node -v和npm -v获取版本号；来查看是否安装Nodejs和Npm。然后在项目目录下使用下面命令来安装

项目运行所需要的第三方包。

```shell
cnpm/npm install
```

安装后，通过下面命令给index.js和config.json添加可读权限。

```
chmod +x index.js   chmod +x config.json
```

最后，通过下面命令来运行项目。

```
node index.js  或者  npm/cnpm start
```

注意，项目默认运行端口为8082，如果有其他项目占用该端口会使得该项目无法运行！

## 三、后台运行

运行项目后直接退出终端会导致项目停止运行。如果想保留项目到后台运行，可以安装screen来创建后台会话。这里命令以Ubuntu/Debian系统举例。

```
sudo apt update
apt install screen
screen -S proxy（这里是会话名）
cd ~/proxy && node index.js（进入新会话，执行项目）
```

然后按Ctrl+A+D来退出新创建的会话，使用screen -ls即可查看刚才创建的新会话。

可以通过screen -r proxy(会话名)的方式来返回创建的新会话！

## 四、配置文件简述

项目配置文件为config.json。项目使用chokidar模块来实时监听文件变化，所以修改信息（除端口外）无需重启项目即可生效！

port后即项目运行端口号，secret后即秘钥内容，blacklist后即域名黑名单（用户无法访问该域名及其子域名）！

