// 健康检查 API 端点
export default defineEventHandler(async (event) => {
  try {
    // 基础健康检查
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'operational',
      },
    }

    // 在数据库连接实现后，将添加数据库健康检查
    // const db = await getDatabaseConnection()
    // await db.execute(sql`SELECT 1`)
    // healthStatus.services.database = 'operational'

    return healthStatus
  }
  catch (error) {
    setResponseStatus(event, 503)
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        api: 'operational',
        database: 'error',
      },
    }
  }
})
