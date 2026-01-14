# 01. JavaScript (ES6+) - 购物车逻辑实战

现代前端开发已经不是从前的 `jQuery` 一把梭了。ES6+ 带来了极大的生产力提升。
本节课，我们通过编写一个**电商购物车**的核心逻辑，来掌握必须学会的现代语法。

## 🛠️ 准备工作：哪里可以运行代码？

1.  **浏览器控制台 (推荐)**:
    - 打开 Chrome/Edge 浏览器。
    - 按 `F12` 或右键 -> “检查” (Inspect)。
    - 点击 **Console** 标签页。
    - 把代码粘进去，回车即可。
2.  **Node.js**:
    - 如果你经常写 JS，建议安装 [Node.js](https://nodejs.org/)。
    - 创建一个 file.js，然后运行 `node file.js`。

---

---

## 🎭 场景一：商品清单 (Variables & Destructuring)

### 1. 变量声明：抛弃 `var`

我们的购物车数据是不会凭空消失的（引用地址不变），但里面的商品数量会变。

```javascript
// ✅ 最佳实践：
// 95% 的情况用 const (定义常量或对象/数组引用)
// 5% 的情况用 let (需要重新赋值的基础类型，如计数器)
// 永远别用 var！

const cart = [
	{ id: 101, name: 'Mechanic Keyboard', price: 299, stock: 5 },
	{ id: 102, name: 'Gaming Mouse', price: 99, stock: 0 },
	{ id: 103, name: 'Monitor 4K', price: 1999, stock: 2 },
]
```

### 2. 解构赋值 (Destructuring)

你想打印第一件商品的名字和价格。

```javascript
const [firstItem] = cart // 数组解构，取出第一个元素
const { name, price } = firstItem // 对象解构，取出属性

console.log(`First Item: ${name}, Price: $${price}`)
// 输出: First Item: Mechanic Keyboard, Price: $299
```

---

## 🎭 场景二：处理购物车数据 (Array Methods)

老板提需求了：“把所有有货的商品找出来，打个 9 折，算出总价。”
这是最经典的 **Map-Filter-Reduce** 三连击。

```javascript
// 1. Filter: 只要有库存的 (stock > 0)
const availableItems = cart.filter((item) => item.stock > 0)

// 2. Map: 给所有商品打 9 折
// 注意：不要修改原对象，要返回新对象 (...Spread Operator)
const discountedItems = availableItems.map((item) => ({
	...item, // 展开原有属性
	price: item.price * 0.9, // 覆盖价格
}))

// 3. Reduce: 算总价 (初始值 0)
const totalPrice = discountedItems.reduce((sum, item) => sum + item.price, 0)

console.log(`Total Price: $${totalPrice}`)
```

- **心得**: 这三个方法都是**非破坏性**的，它们不会修改原数组 `cart`，这在 React 开发中至关重要（不可变数据流）。

---

## 🎭 场景三：异步结账 (Async/Await)

用户点击“结账”，我们需要请求后端 API。但这需要时间。

### 1. Promise 的地狱 (Old School)

以前我们这么写，一旦这里面还有逻辑，就缩进得很难看：

```javascript
function checkout() {
	api
		.pay()
		.then((res) => {
			console.log('Success')
			return api.sendEmail()
		})
		.catch((err) => {
			console.error('Failed')
		})
}
```

### 2. Async/Await (Modern)

现在我们可以像写同步代码一样写异步代码。

```javascript
// 必须在函数前加 async 关键字
const handleCheckout = async () => {
	try {
		// 等待支付结果，直到拿到数据才往下走
		const paymentResult = await api.pay(totalPrice)

		// 只有支付成功了才会执行这行
		console.log('Payment ID:', paymentResult.id)

		// 甚至可以用 Optional Chaining (?.) 来防止报错
		// 如果 user 为 null，就不会去取 .email，直接返回 undefined
		const userEmail = paymentResult.user?.contact?.email ?? 'default@mail.com'

		await api.sendEmail(userEmail)
	} catch (error) {
		// 任何一步出错（网络挂了、钱不够），都会跳到这里
		console.error('Checkout Failed:', error.message)
	}
}
```

---

> 💡 **核心最佳实践**
>
> 1.  **箭头函数 (Arrow Functions)**: `const add = (a, b) => a + b;`。不仅写起来短，而且它没有自己的 `this`，在组件回调中非常安全。
> 2.  **空值合并 (??)**: 用 `const name = input ?? "Guest"` 代替 `||`。因为 `||` 会把 `0` 或 `""` (空字符串) 也当成假值处理，导致 Bug。
