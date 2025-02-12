#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# 错误处理
set -e
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
trap 'if [ $? -ne 0 ]; then log_error "命令执行失败: $last_command"; exit 1; fi' EXIT

# 检查是否以root权限运行
if [[ $EUID -ne 0 ]]; then
   log_error "此脚本需要root权限运行"
   exit 1
fi

# 环境变量配置
PROJECT_NAME="legal_ai"
PROJECT_PATH="/var/www/$PROJECT_NAME"
DOMAIN_NAME="your_domain.com"  # 替换为你的域名
PORT="8080"
GIT_REPO="https://github.com/Mmxfq/Law-AI.git"
# GitHub认证信息（如果是私有仓库，请配置以下变量）
GITHUB_TOKEN="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"  # 请在运行脚本时设置你的 GitHub Token
#GITHUB_SSH_KEY=""  # 或者设置你的 SSH 密钥路径
# 选择认证方式: token 或 ssh
AUTH_METHOD="token"

# 1. 系统更新和依赖安装
log_info "开始系统更新..."
apt-get update && apt-get upgrade -y

log_info "安装系统依赖..."
apt-get install -y python3-pip python3-venv nginx supervisor \
    build-essential libssl-dev libffi-dev python3-dev \
    git curl wget

# 2. 创建项目目录
log_info "创建项目目录..."
mkdir -p $PROJECT_PATH
chown -R $SUDO_USER:$SUDO_USER $PROJECT_PATH

# 3. 克隆项目代码
log_info "克隆项目代码..."
if [ "$AUTH_METHOD" = "token" ] && [ ! -z "$GITHUB_TOKEN" ]; then
    # 使用Personal Access Token
    REPO_URL="https://${GITHUB_TOKEN}@github.com/Mmxfq/Law-AI.git"
    su - $SUDO_USER << EOF
    cd $PROJECT_PATH
    git clone $REPO_URL .
EOF
elif [ "$AUTH_METHOD" = "ssh" ] && [ ! -z "$GITHUB_SSH_KEY" ]; then
    # 使用SSH密钥
    su - $SUDO_USER << EOF
    # 配置SSH
    mkdir -p ~/.ssh
    cp $GITHUB_SSH_KEY ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan github.com >> ~/.ssh/known_hosts
    
    # 克隆仓库
    cd $PROJECT_PATH
    git clone git@github.com:Mmxfq/Law-AI.git .
EOF
else
    # 尝试普通克隆（如果是公开仓库）
    su - $SUDO_USER << EOF
    cd $PROJECT_PATH
    git clone $GIT_REPO .
EOF
fi

# 4. 复制项目文件
log_info "复制项目文件..."
rsync -av --exclude 'venv' --exclude '__pycache__' --exclude '.git' ./ $PROJECT_PATH/

# 5. 创建Python虚拟环境
log_info "创建并配置Python虚拟环境..."
su - $SUDO_USER << EOF
cd $PROJECT_PATH
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install gunicorn
EOF

# 6. 安装项目依赖
log_info "安装Python依赖..."
su - $SUDO_USER << EOF
cd $PROJECT_PATH
source venv/bin/activate
pip install -r requirements.txt
EOF

# 7. 创建必要的目录
log_info "创建上传目录..."
mkdir -p $PROJECT_PATH/static/uploads
mkdir -p $PROJECT_PATH/static/documents
chmod -R 755 $PROJECT_PATH/static
chown -R $SUDO_USER:$SUDO_USER $PROJECT_PATH/static

# 8. 创建入口脚本
log_info "创建入口脚本..."
cat > $PROJECT_PATH/entrypoint.sh << EOF
#!/bin/bash

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 创建必要的目录
mkdir -p static/uploads
mkdir -p static/documents

# 设置环境变量
export FLASK_ENV=production
export FLASK_APP=wsgi.py

# 启动应用
exec gunicorn wsgi:app -w 4 -b 0.0.0.0:$PORT
EOF

chmod +x $PROJECT_PATH/entrypoint.sh
chown $SUDO_USER:$SUDO_USER $PROJECT_PATH/entrypoint.sh

# 9. 配置Supervisor
log_info "配置Supervisor..."
cat > /etc/supervisor/conf.d/$PROJECT_NAME.conf << EOF
[program:$PROJECT_NAME]
directory=$PROJECT_PATH
command=/bin/bash -c "$PROJECT_PATH/entrypoint.sh"
user=$SUDO_USER
autostart=true
autorestart=true
stderr_logfile=/var/log/$PROJECT_NAME/$PROJECT_NAME.err.log
stdout_logfile=/var/log/$PROJECT_NAME/$PROJECT_NAME.out.log
environment=PYTHONPATH="$PROJECT_PATH"
EOF

# 10. 创建日志目录
log_info "创建日志目录..."
mkdir -p /var/log/$PROJECT_NAME
chown -R $SUDO_USER:$SUDO_USER /var/log/$PROJECT_NAME

# 11. 配置Nginx
log_info "配置Nginx..."
cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    access_log /var/log/nginx/${PROJECT_NAME}_access.log;
    error_log /var/log/nginx/${PROJECT_NAME}_error.log;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static {
        alias $PROJECT_PATH/static;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    client_max_body_size 20M;
}
EOF

# 启用Nginx配置
ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 12. 配置防火墙
log_info "配置防火墙..."
if command -v ufw >/dev/null 2>&1; then
    ufw allow 80/tcp
    ufw allow $PORT/tcp
    ufw allow 22/tcp
fi

# 13. 重启服务
log_info "重启服务..."
systemctl restart supervisor
systemctl restart nginx

# 14. 检查服务状态
log_info "检查服务状态..."
if systemctl is-active --quiet supervisor && systemctl is-active --quiet nginx; then
    log_info "所有服务启动成功！"
else
    log_error "服务启动失败，请检查日志"
    exit 1
fi

# 15. 输出部署信息
log_info "部署完成！"
echo -e "\n${GREEN}部署信息：${NC}"
echo -e "项目路径：$PROJECT_PATH"
echo -e "域名：$DOMAIN_NAME"
echo -e "端口：$PORT"
echo -e "日志路径：/var/log/$PROJECT_NAME/"
echo -e "Nginx配置：/etc/nginx/sites-available/$PROJECT_NAME"
echo -e "Supervisor配置：/etc/supervisor/conf.d/$PROJECT_NAME.conf"
echo -e "入口脚本：$PROJECT_PATH/entrypoint.sh"

echo -e "\n${YELLOW}请确保以下事项：${NC}"
echo "1. 检查数据库连接是否正常"
echo "2. 确认所有环境变量是否正确设置"
echo "3. 检查日志文件中是否有错误信息"
echo "4. 验证域名 $DOMAIN_NAME 是否正确解析到服务器"
