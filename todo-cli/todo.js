#!/usr/bin/env node

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 数据库文件路径
const dbPath = path.join(__dirname, "todos.db");

// 初始化数据库
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
                description TEXT,
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

// 添加新的待办事项
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

// 标记待办事项为完成
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

// 删除待办事项
async function deleteTodo(id) {
  const db = await initDatabase();

  return new Promise((resolve, reject) => {
    const stmt = db.prepare("DELETE FROM todos WHERE id = ?");

    stmt.run([id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        console.log(`❌ 未找到 ID 为 ${id} 的待办事项`);
        resolve(false);
      } else {
        console.log(`🗑️  成功删除待办事项 ${id}！`);
        resolve(true);
      }
    });

    stmt.finalize();
    db.close();
  });
}

// 显示帮助信息
function showHelp() {
  console.log(`
📋 Todo CLI - 命令行待办事项管理工具

用法:
  todo [选项] [参数]

选项:
  --new <标题> [描述]     添加新的待办事项
  --list [过滤器]        列出待办事项
                        过滤器: all(默认) | pending | done
  --done <ID>           标记待办事项为已完成
  --delete <ID>         删除待办事项
  --help               显示此帮助信息
  --version            显示版本信息

示例:
  todo --new "学习 Node.js" "完成 CRUD 操作练习"
  todo --list pending
  todo --done 1
  todo --delete 2

作者: Your Name
许可证: MIT
    `);
}

// 显示版本信息
function showVersion() {
  const packageJson = require("./package.json");
  console.log(`📋 Todo CLI v${packageJson.version}`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    showHelp();
    return;
  }

  try {
    switch (args[0]) {
      case "--new":
        if (args.length < 2) {
          console.log("❌ 错误: 请提供待办事项标题");
          console.log("用法: todo --new <标题> [描述]");
          process.exit(1);
        }
        const title = args[1];
        const description = args[2] || "";
        await addTodo(title, description);
        break;

      case "--list":
        const filter = args[1] || "all";
        if (!["all", "pending", "done"].includes(filter)) {
          console.log("❌ 错误: 无效的过滤器，请使用 all、pending 或 done");
          process.exit(1);
        }
        await listTodos(filter);
        break;

      case "--done":
        if (args.length < 2) {
          console.log("❌ 错误: 请提供待办事项 ID");
          console.log("用法: todo --done <ID>");
          process.exit(1);
        }
        const doneId = parseInt(args[1]);
        if (isNaN(doneId)) {
          console.log("❌ 错误: ID 必须是数字");
          process.exit(1);
        }
        await markTodoDone(doneId);
        break;

      case "--delete":
        if (args.length < 2) {
          console.log("❌ 错误: 请提供待办事项 ID");
          console.log("用法: todo --delete <ID>");
          process.exit(1);
        }
        const deleteId = parseInt(args[1]);
        if (isNaN(deleteId)) {
          console.log("❌ 错误: ID 必须是数字");
          process.exit(1);
        }
        await deleteTodo(deleteId);
        break;

      case "--version":
        showVersion();
        break;

      default:
        console.log(`❌ 错误: 未知选项 '${args[0]}'`);
        console.log("使用 --help 查看可用选项");
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ 发生错误:", error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  addTodo,
  listTodos,
  markTodoDone,
  deleteTodo,
  showHelp,
  showVersion,
};
