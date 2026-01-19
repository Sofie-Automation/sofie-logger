const { getLogger, loggingConfigureWithDefault } = require('../dist/index.js')

// This is not a proper unit test, but a manual test to check for memory leaks when creating many loggers.

async function main() {
	await loggingConfigureWithDefault({
		reset: true,
	})

	const memoryUsageBefore = process.memoryUsage().heapUsed

	console.log(`Memory usage before: ${formatBytes(memoryUsageBefore)}`)
	const loggers = []
	for (let i = 0; i < 1000 * 1000; i++) {
		// loggers.push(getLogger(`memory-leak-test-${i}`))
		getLogger(`memory-leak-test-${i}`)
	}
	const memoryUsageAfter = process.memoryUsage().heapUsed
	console.log(`Memory usage after: ${formatBytes(memoryUsageAfter)}`)

	loggers.splice(0, loggers.length) // Clear references

	// Run garbage collection:
	if (!global.gc) {
		throw new Error('Garbage collection is not exposed. Run the test with --expose-gc flag.')
	}

	for (let i = 0; i < 5; i++) {
		global.gc({
			type: 'major',
		})
		await sleep(100) // Give GC some time
		const memoryUsageFinal = process.memoryUsage().heapUsed
		console.log(`Memory usage final: ${formatBytes(memoryUsageFinal)}`)
	}
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(() => resolve(), ms))
}
function formatBytes(bytes) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
	if (bytes === 0) return '0 Byte'
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}

main().catch(console.error)
