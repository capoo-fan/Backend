# 待办清单的开发知识点

- sqlite3 数据库的使用
- _initDatabase_ 创建数据库
  - return new promise 异步操作
    - resolve: 成功时调用，返回数据库连接对象
    - reject: 失败时调用，返回错误信息

``` sql
db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        reject(err);
    } else {
        resolve(db);
    }
});
```

创建数据库的表结构 
- INTEGER PRIMARY KEY AUTOINCREMENT 自动递增
- TEXT NOT NULL 不为空
- TEXT 可选
- TEXT DEFAULT 'pending 默认为待办状态
- DATETIME DEFAULT CURRENT_TIMESTAMP 默认当前时间戳