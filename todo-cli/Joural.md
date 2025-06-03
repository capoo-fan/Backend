# 待办清单的开发知识点

- sqlite3 数据库的使用
- _initDatabase_ 创建数据库
  - return new promise 异步操作
    - resolve: 成功时调用，返回数据库连接对象
    - reject: 失败时调用，返回错误信息

```javascript
初始化数据库;
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
    });
    db.run(
      `
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TcEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `,
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      }
    );
  });
}
```

创建数据库的表结构

- INTEGER PRIMARY KEY AUTOINCREMENT 自动递增
- TEXT NOT NULL 不为空
- TEXT 可选
- TEXT DEFAULT 'pending 默认为待办状态
- DATETIME DEFAULT CURRENT_TIMESTAMP 默认当前时间戳

---

## 添加待办事项的函数

```javascript
async function addTodo(title, description = "") {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
            INSERT INTO todos (title, description) 
            VALUES (?, ?)
        `);

    stmt.run([title, description], function (err) {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ 成功添加待办事项！ID: ${this.lastID}`);
        console.log(`📝 标题: ${title}`);
        if (description) {
          console.log(`📋 描述: ${description}`);
        }
        resolve(this.lastID);
      }
    });

    stmt.finalize();
    db.close();
  });
}
```

- initDatabse() 初始化数据库
- stmt.run([], function (err) {}) 执行插入操作,function(err) {} 回调函数处理错误

### promise 的使用

Promise 有三种状态：

1.  pending（待定）- 初始状态
2.  fulfilled（已完成）- 操作成功完成
3.  rejected（已拒绝）- 操作失败

如果错误，使用 reject(err) 抛出错误信息，成功则使用 resolve(this.lastID) 返回新插入的待办事项 ID。

#### 使用模式

```javascript
return new Promise((resolve, reject) => {
  异步操作((err, result) => {
    if (err) {
      reject(err); // 失败时调用
    } else {
      resolve(result); // 成功时调用，传递结果
    }
  });
});
```

#### 调用者接收 resolve 的值

```javascript
// 通过 await
const result = await promiseFunction();

// 通过 .then()
promiseFunction().then((result) => {
  console.log(result);
});
```

## this.lastID 详解

### this 的指向

- **在 stmt.run() 回调中**: `this` 指向 SQLite3 的 Statement 对象
- **必须使用 function**: 箭头函数无法获取正确的 `this` 上下文

```javascript
// ✅ 正确用法
stmt.run([title, description], function (err) {
  console.log(this.lastID); // this = Statement 对象
});

// ❌ 错误用法
stmt.run([title, description], (err) => {
  console.log(this.lastID); // this = undefined
});
```

#### lastID 的含义

- **定义**: 最后插入记录的主键 ID
- **类型**: 整数，对应表中的 AUTOINCREMENT 字段
- **用途**: 获取新创建记录的唯一标识符

#### Statement 对象的其他属性

- **this.lastID**: 最后插入的记录 ID
- **this.changes**: 受影响的记录数
- **this.sql**: 执行的 SQL 语句

#### 实际应用

```javascript
// 创建记录并获取 ID
const newTodoId = await addTodo("学习", "学习 SQLite");
console.log(`新待办事项 ID: ${newTodoId}`);

// 使用 ID 进行后续操作
await markTodoDone(newTodoId);
```

### listTodos() 函数详解

```javascript
// 列出待办事项
async function listTodos(filter = "all") {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM todos";
    const params = [];

    if (filter === "pending") {
      query += " WHERE status = ?";
      params.push("pending");
    } else if (filter === "done") {
      query += " WHERE status = ?";
      params.push("done");
    }

    query += " ORDER BY created_at DESC";

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log("📭 没有找到待办事项");
        resolve([]);
        return;
      }

      console.log(`\n📋 待办事项列表 (${filter}):`);
      console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );

      rows.forEach((todo) => {
        const status = todo.status === "done" ? "✅" : "⏳";
        const date = new Date(todo.created_at).toLocaleDateString("zh-CN");

        console.log(`${status} [${todo.id}] ${todo.title}`);
        if (todo.description) {
          console.log(`   📝 ${todo.description}`);
        }
        console.log(`   📅 创建时间: ${date}`);
        console.log("");
      });

      resolve(rows);
    });

    db.close();
  });
}
```

#### 字符串拼接构建 WHERE 条件

```javascript
let query = "SELECT * FROM todos";
const params = [];

if (filter === "pending") {
  query += " WHERE status = ?"; // 动态添加 WHERE 条件
  params.push("pending"); // 添加对应参数
}

query += " ORDER BY created_at DESC";
```

### 参数化查询的优势

- **防止 SQL 注入**: 用户输入被当作数据而非代码
- **自动转义**: SQLite 自动处理特殊字符
- **类型安全**: 确保数据类型正确

### 不同过滤条件生成的 SQL

```sql
-- filter = "all"
SELECT * FROM todos ORDER BY created_at DESC

-- filter = "pending"
SELECT * FROM todos WHERE status = ? ORDER BY created_at DESC
-- 参数: ["pending"]

-- filter = "done"
SELECT * FROM todos WHERE status = ? ORDER BY created_at DESC
-- 参数: ["done"]
```

### db.all() 函数的参数处理

#### 参数接收和解析

```javascript
db.all(query, params, (err, rows) => { ... })
```

- **query**: SQL 查询语句 (字符串)
- **params**: 参数数组
- **callback**: 回调函数

#### SQLite 内部处理流程

1. **解析 SQL 语句**: 识别 `?` 占位符的位置，params 会逐个替换
2. **参数绑定**: 按顺序将 params 数组中的值绑定到占位符
3. **类型转换**: 自动处理数据类型转换
4. **安全转义**: 防止 SQL 注入攻击
5. **执行查询**: 生成最终 SQL 并执行

---

## 标记完成待办事项的函数

```javascript
async function markTodoDone(id) {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
            UPDATE todos 
            SET status = 'done', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);

    stmt.run([id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        console.log(`❌ 未找到 ID 为 ${id} 的待办事项`);
        resolve(false);
      } else {
        console.log(`✅ 成功标记待办事项 ${id} 为已完成！`);
        resolve(true);
      }
    });

    stmt.finalize();
    db.close();
  });
}
```

### UPDATE 操作的 SQL 语句

```sql
UPDATE todos
SET status = 'done', updated_at = CURRENT_TIMESTAMP
WHERE id = ?
```

**SQL 语句分析：**

- **UPDATE todos**: 更新 todos 表
- **SET status = 'done'**: 将状态字段设置为 'done'
- **updated_at = CURRENT_TIMESTAMP**: 同时更新修改时间为当前时间
- **WHERE id = ?**: 只更新指定 ID 的记录

#### this.changes 的作用

在 UPDATE 操作中，`this.changes` 表示**受影响的记录数**：

```javascript
stmt.run([id], function (err) {
  console.log(this.changes); // 0 = 没找到记录，1 = 更新了1条记录
  console.log(this.lastID); // UPDATE 中通常是 0
});
```

**三种处理情况：**

1. **数据库错误**: `err` 不为空 → `reject(err)`
2. **记录不存在**: `this.changes === 0` → `resolve(false)`
3. **更新成功**: `this.changes > 0` → `resolve(true)`
