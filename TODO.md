# Tabby SSH 快速连接密码支持

## 功能说明

支持通过命令行参数 `--password` 自动填充 SSH 密码，无需手动输入。

## 命令格式

```bash
# 带密码自动连接
yarn start -- --no-sandbox quickConnect ssh "root:123@10.168.2.98:22"

# 不带密码（需要手动输入）
yarn start -- --no-sandbox quickConnect ssh "root@10.168.2.98:22"
```

## 实现细节

### 修改的文件

1. **tabby-ssh/src/profiles.ts**
   - `quickConnect()` 函数：解析 `user:password@host:port` 格式
   - 固定 quick connect ID 为 `quickconnect-ssh-profile`

2. **tabby-ssh/src/session/ssh.ts**
   - `populateStoredPasswordsForResolvedUsername()` 函数：检测 quick connect profile 并自动保存密码到 keytar

3. **tabby-ssh/src/api/interfaces.ts**
   - `SSHProfile` 接口：添加 `id` 和 `auth` 字段
   - `SSHProfileOptions` 接口：添加 `auth` 和 `id` 字段

### 使用方法

```bash
# 切换到 Node 24
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use --delete-prefix v24.13.1

# 启动（带密码自动连接）
yarn start -- --no-sandbox quickConnect ssh "root:123@10.168.2.98:22"
```

## 测试结果

- ✅ 代码修改完成
- ✅ 项目编译成功
- ⚠️ 需要使用 `--no-sandbox` 参数绕过 /dev/shm 限制

## 注意

- 密码格式：`user:password@host:port`
- 密码中包含冒号时需转义或使用引号
