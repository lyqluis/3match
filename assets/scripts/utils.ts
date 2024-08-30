export const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		// 随机生成一个小于 i 的整数 j
		const j = Math.floor(Math.random() * (i + 1))
		// 交换元素 array[i] 和 array[j]
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}
