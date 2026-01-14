# 02. SQL 基础入门 - 前端也得会点数据库

前端工程师常问：“我为什么要学 SQL？后端会写 API 给我啊。”
但在全栈时代，或者当你需要调试“数据为什么对不上”时，能直接查询数据库，你的排查效率将提升 10 倍。

我们将构建一个微型的**学生成绩管理系统**来通过这关。

## 🛠️ 准备工作：哪里可以运行 SQL？

不要被“安装数据库”吓跑。对于学习来说，我们推荐直接使用在线沙箱，**无需安装任何软件**。

1.  打开浏览器，访问 **[SQLite Online](https://sqliteonline.com/)**。
2.  在左侧点击 **Execute** 按钮上方的空白输入框。
3.  将下文的代码复制进去，点击 **Run** 即可看到结果。

> _注：该网站数据保存在浏览器本地，刷新可能丢失，记得保存你的 SQL 代码。_

---

---

## 🎭 场景一：建房子 (DDL - Data Definition)

首先，我们需要设计“表结构”来存数据。

### 1. 创建表 (Create)

我们需要一张 `students` 表。

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,      -- 学号：自增主键，唯一标识
    name VARCHAR(50) NOT NULL,  -- 姓名：字符串，不能为空
    age INT,                    -- 年龄：整数
    class_id INT,               -- 班级ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 入学时间
);
```

### 2. 修改表 (Alter)

突然想起忘记存性别了。

```sql
ALTER TABLE students ADD COLUMN gender VARCHAR(10);
```

### 3. 拆迁 (Drop)

如果这个表设计废了，重来。（**高危操作**）

```sql
DROP TABLE students;
```

---

## 🎭 场景二：录入数据 (DML - Data Manipulation)

房子建好了，开始住人。

### 1. 插入 (Insert)

为了测试，我们录入 3 个学生。

```sql
INSERT INTO students (name, age, class_id, gender) VALUES
('张三', 18, 101, 'Male'),
('李四', 19, 101, 'Female'),
('王五', 20, 102, 'Male');
```

### 2. 更新 (Update)

张三过生日了，长了一岁。
**千万别忘了写 `WHERE`！** 不然全校学生都长一岁。

```sql
UPDATE students SET age = 19 WHERE name = '张三';
```

### 3. 删除 (Delete)

王五退学了。

```sql
DELETE FROM students WHERE name = '王五';
```

---

## 🎭 场景三：校长查房 (Query - The Art of SELECT)

`SELECT` 是最常用的语句。你需要什么样的报表，它都能给你。

### 1. 基础查询

```sql
-- "把所有名叫张三的学生叫出来"
SELECT * FROM students WHERE name = '张三';

-- "谁是 101 班的？"
SELECT id, name FROM students WHERE class_id = 101;
```

### 2. 排序与分页 (Order & Limit)

“给我看年龄最大的前 10 名学生。” —— 典型的排行榜逻辑。

```sql
SELECT * FROM students
ORDER BY age DESC -- 降序 (Descend)
LIMIT 10;
```

### 3. 模糊搜索 (Like)

“有个学生姓李，叫李什么来着...”

```sql
-- % 代表任意个字符
SELECT * FROM students WHERE name LIKE '李%';
```

---

## 🎭 场景四：统计报表 (Aggregation)

期末了，要出统计数据。这时候需要聚合函数。

### 1. 计数 (Count)

“全校一共有多少人？”

```sql
SELECT COUNT(*) FROM students;
```

### 2. 分组统计 (Group By)

“每个班各有多少人？平均年龄是多少？”

```sql
SELECT
    class_id,
    COUNT(*) as student_count, -- 人数
    AVG(age) as avg_age        -- 平均年龄
FROM students
GROUP BY class_id; -- 按班级分组
```

---

## 🎭 场景五：跨表查询 (The Power of JOIN)

**这是 SQL 的灵魂**。目前我们只查了 `students` 表，但 `class_id` 只是个数字。
我们需要一张 `classes` 表来存班级名字。

### 0. 准备数据

```sql
-- 建班级表
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(50)
);

INSERT INTO classes (id, class_name) VALUES (101, '实验班'), (102, '普通班');
```

### 1. 内连接 (INNER JOIN)

“我要看学生名字和他的班级名字。”
只返回**两个表里都有**的数据。如果学生没填班级，或者班级里没学生，不显示。

```sql
SELECT
    s.name,
    c.class_name
FROM students s
INNER JOIN classes c ON s.class_id = c.id;
```

### 2. 左连接 (LEFT JOIN)

“我要看所有学生，哪怕他没有分配班级（班级显示为 NULL）。”
**保留左表（students）的所有数据**。

```sql
SELECT
    s.name,
    c.class_name
FROM students s
LEFT JOIN classes c ON s.class_id = c.id;
```

---

> 💡 **核心最佳实践**
>
> 1.  **拒绝 `SELECT *`**: 在写后端代码时，尽量明确写出 `SELECT id, name`。因为如果表里将来加了一个超大的字段（比如存文章内容的 `content`），你用 `SELECT *` 每次都把它查出来，会让网络传输变慢，甚至撑爆内存。
> 2.  **索引 (Index)**: 为什么 `WHERE name = '张三'` 很快？因为给 `name` 字段加了索引（目录）。但不要给所有字段都加索引，因为写操作会变慢（每次插入都要更新目录）。
