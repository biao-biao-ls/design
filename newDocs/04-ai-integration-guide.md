# AI 集成开发技术指导文档

## 📋 文档概述

**适用场景**: 需要集成 AI 功能的应用项目  
**技术特点**: RAG + LangChain + 向量数据库 + 流式响应  
**参考项目**: 硬件学习平台的 AI 问答系统  
**文档版本**: v1.0  

## 🎯 架构概述

基于当前项目验证的 AI 集成方案，提供完整的 AI 应用开发指导：

- **RAG 架构**: 检索增强生成，提高回答准确性
- **多模型支持**: OpenAI GPT-4 + Anthropic Claude
- **向量检索**: Qdrant 向量数据库，高效语义搜索
- **流式响应**: Server-Sent Events，实时流式输出
- **成本控制**: 智能缓存 + 模型选择策略

## 🏗️ AI 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户交互层                                │
├─────────────────────────────────────────────────────────────────┤
│ 前端界面 │ 聊天组件 │ 流式显示 │ 语音输入 │ 文件上传            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API 网关层                                 │
├─────────────────────────────────────────────────────────────────┤
│ • 请求验证                                                      │
│ • 用户认证                                                      │
│ • 频率限制                                                      │
│ • 流式响应处理                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI 服务编排层 (LangChain)                   │
├─────────────────────────────────────────────────────────────────┤
│ 问题分析 │ 意图识别 │ 上下文管理 │ 工作流编排 │ 结果后处理      │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   知识检索层     │ │   LLM 推理层     │ │   缓存策略层     │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • 向量检索       │ │ • GPT-4 Turbo    │ │ • Redis 缓存     │
│ • 语义搜索       │ │ • Claude 3       │ │ • 相似问题匹配   │
│ • 相关性排序     │ │ • 模型选择       │ │ • 结果缓存       │
│ • 上下文构建     │ │ • 参数优化       │ │ • 成本控制       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Qdrant 向量库   │ │   知识库管理     │ │   监控分析层     │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • 文档向量化     │ │ • 文档解析       │ │ • 使用统计       │
│ • 相似度计算     │ │ • 内容更新       │ │ • 质量评估       │
│ • 快速检索       │ │ • 版本管理       │ │ • 成本分析       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 技术栈选型

#### AI 技术栈
```typescript
const AI_TECH_STACK = {
  // 核心框架
  orchestration: 'LangChain',
  
  // 大语言模型
  llm: {
    primary: 'OpenAI GPT-4 Turbo',
    secondary: 'Anthropic Claude 3',
    embedding: 'OpenAI text-embedding-3-small'
  },
  
  // 向量数据库
  vectorDB: {
    primary: 'Qdrant',
    alternative: 'Pinecone'
  },
  
  // 文档处理
  documentProcessing: {
    pdf: 'pdf-parse',
    markdown: 'markdown-it',
    chunking: 'langchain/text_splitter'
  },
  
  // 缓存和优化
  caching: {
    redis: 'ioredis',
    similarity: 'cosine-similarity'
  }
}
```

## 📁 项目结构

### AI 相关目录结构

```
project-root/
├── apps/backend/src/
│   ├── ai/                           # AI 模块
│   │   ├── controllers/              # AI API 控制器
│   │   │   ├── chat.controller.ts    # 聊天接口
│   │   │   ├── knowledge.controller.ts # 知识库管理
│   │   │   └── embedding.controller.ts # 向量化接口
│   │   │
│   │   ├── services/                 # AI 服务层
│   │   │   ├── llm.service.ts        # LLM 服务
│   │   │   ├── rag.service.ts        # RAG 服务
│   │   │   ├── embedding.service.ts  # 向量化服务
│   │   │   ├── knowledge.service.ts  # 知识库服务
│   │   │   └── cache.service.ts      # 缓存服务
│   │   │
│   │   ├── chains/                   # LangChain 工作流
│   │   │   ├── qa-chain.ts           # 问答链
│   │   │   ├── summarize-chain.ts    # 摘要链
│   │   │   └── analysis-chain.ts     # 分析链
│   │   │
│   │   ├── prompts/                  # 提示词模板
│   │   │   ├── system-prompts.ts     # 系统提示词
│   │   │   ├── qa-prompts.ts         # 问答提示词
│   │   │   └── context-prompts.ts    # 上下文提示词
│   │   │
│   │   ├── utils/                    # AI 工具函数
│   │   │   ├── text-splitter.ts      # 文本分割
│   │   │   ├── similarity.ts         # 相似度计算
│   │   │   └── token-counter.ts      # Token 计数
│   │   │
│   │   └── types/                    # AI 类型定义
│   │       ├── llm.types.ts          # LLM 类型
│   │       ├── rag.types.ts          # RAG 类型
│   │       └── knowledge.types.ts    # 知识库类型
│   │
│   └── knowledge/                    # 知识库管理
│       ├── documents/                # 文档存储
│       ├── processors/               # 文档处理器
│       └── indexers/                 # 索引器
│
├── packages/ai-utils/                # AI 工具包
│   ├── src/
│   │   ├── llm/                      # LLM 客户端
│   │   ├── embedding/                # 向量化工具
│   │   ├── rag/                      # RAG 工具
│   │   └── cache/                    # 缓存工具
│   └── package.json
│
└── apps/web/app/
    ├── components/ai/                # AI 前端组件
    │   ├── ChatInterface.vue         # 聊天界面
    │   ├── MessageBubble.vue         # 消息气泡
    │   ├── StreamingText.vue         # 流式文本
    │   └── KnowledgeUpload.vue       # 知识上传
    │
    ├── composables/
    │   ├── useChat.ts                # 聊天逻辑
    │   ├── useStreaming.ts           # 流式处理
    │   └── useKnowledge.ts           # 知识库管理
    │
    └── stores/
        ├── chat.ts                   # 聊天状态
        └── knowledge.ts              # 知识库状态
```

## 🤖 核心 AI 服务实现

### 1. LLM 服务配置

```typescript
// apps/backend/src/ai/services/llm.service.ts
import { Injectable } from '@nestjs/common'
import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'

@Injectable()
export class LLMService {
  private openai: OpenAI
  private anthropic: Anthropic

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }

  async generateResponse(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: 'gpt-4' | 'claude-3'
      temperature?: number
      maxTokens?: number
      stream?: boolean
    } = {}
  ) {
    const {
      model = 'gpt-4',
      temperature = 0.7,
      maxTokens = 2000,
      stream = false
    } = options

    if (model === 'gpt-4') {
      return this.generateOpenAIResponse(messages, {
        temperature,
        maxTokens,
        stream
      })
    } else {
      return this.generateAnthropicResponse(messages, {
        temperature,
        maxTokens,
        stream
      })
    }
  }

  private async generateOpenAIResponse(
    messages: Array<{ role: string; content: string }>,
    options: { temperature: number; maxTokens: number; stream: boolean }
  ) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as any,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: options.stream
    })

    return response
  }

  private async generateAnthropicResponse(
    messages: Array<{ role: string; content: string }>,
    options: { temperature: number; maxTokens: number; stream: boolean }
  ) {
    // 转换消息格式
    const systemMessage = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      system: systemMessage?.content || '',
      messages: userMessages as any,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: options.stream
    })

    return response
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })

    return response.data[0].embedding
  }
}
```

### 2. RAG 服务实现

```typescript
// apps/backend/src/ai/services/rag.service.ts
import { Injectable } from '@nestjs/common'
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'

@Injectable()
export class RAGService {
  private vectorStore: QdrantVectorStore
  private embeddings: OpenAIEmbeddings
  private llm: ChatOpenAI

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    })

    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7
    })

    this.initializeVectorStore()
  }

  private async initializeVectorStore() {
    this.vectorStore = await QdrantVectorStore.fromExistingCollection(
      this.embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: 'knowledge_base'
      }
    )
  }

  async queryKnowledge(
    question: string,
    options: {
      topK?: number
      scoreThreshold?: number
      includeMetadata?: boolean
    } = {}
  ) {
    const {
      topK = 5,
      scoreThreshold = 0.7,
      includeMetadata = true
    } = options

    // 1. 向量检索相关文档
    const relevantDocs = await this.vectorStore.similaritySearchWithScore(
      question,
      topK
    )

    // 2. 过滤低相关性文档
    const filteredDocs = relevantDocs.filter(
      ([doc, score]) => score >= scoreThreshold
    )

    if (filteredDocs.length === 0) {
      return {
        answer: '抱歉，我在知识库中没有找到相关信息。',
        sources: [],
        confidence: 0
      }
    }

    // 3. 构建上下文
    const context = filteredDocs
      .map(([doc, score]) => doc.pageContent)
      .join('\n\n')

    // 4. 生成回答
    const chain = RetrievalQAChain.fromLLM(this.llm, this.vectorStore, {
      returnSourceDocuments: true
    })

    const response = await chain.call({
      query: question,
      context: context
    })

    return {
      answer: response.text,
      sources: filteredDocs.map(([doc, score]) => ({
        content: doc.pageContent,
        metadata: includeMetadata ? doc.metadata : {},
        score: score
      })),
      confidence: this.calculateConfidence(filteredDocs)
    }
  }

  private calculateConfidence(docs: Array<[any, number]>): number {
    if (docs.length === 0) return 0
    
    const avgScore = docs.reduce((sum, [, score]) => sum + score, 0) / docs.length
    return Math.min(avgScore, 1.0)
  }

  async addDocuments(documents: Array<{
    content: string
    metadata: Record<string, any>
  }>) {
    const docs = documents.map(doc => ({
      pageContent: doc.content,
      metadata: doc.metadata
    }))

    await this.vectorStore.addDocuments(docs)
  }
}
```

### 3. 流式响应实现

```typescript
// apps/backend/src/ai/controllers/chat.controller.ts
import { Controller, Post, Body, Sse, MessageEvent } from '@nestjs/common'
import { Observable } from 'rxjs'
import { RAGService } from '../services/rag.service'
import { LLMService } from '../services/llm.service'

@Controller('ai/chat')
export class ChatController {
  constructor(
    private ragService: RAGService,
    private llmService: LLMService
  ) {}

  @Sse('stream')
  async streamChat(
    @Body() body: { question: string; conversationId?: string }
  ): Promise<Observable<MessageEvent>> {
    return new Observable(observer => {
      this.processStreamingChat(body, observer)
    })
  }

  private async processStreamingChat(
    body: { question: string; conversationId?: string },
    observer: any
  ) {
    try {
      // 1. 发送开始信号
      observer.next({
        data: JSON.stringify({
          type: 'start',
          message: '正在思考中...'
        })
      })

      // 2. 检索相关知识
      observer.next({
        data: JSON.stringify({
          type: 'searching',
          message: '正在搜索相关知识...'
        })
      })

      const ragResult = await this.ragService.queryKnowledge(body.question)

      // 3. 构建提示词
      const systemPrompt = this.buildSystemPrompt(ragResult.sources)
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: body.question }
      ]

      // 4. 流式生成回答
      observer.next({
        data: JSON.stringify({
          type: 'generating',
          message: '正在生成回答...'
        })
      })

      const stream = await this.llmService.generateResponse(messages, {
        stream: true
      })

      let fullResponse = ''

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          observer.next({
            data: JSON.stringify({
              type: 'content',
              content: content,
              fullContent: fullResponse
            })
          })
        }
      }

      // 5. 发送完成信号
      observer.next({
        data: JSON.stringify({
          type: 'complete',
          sources: ragResult.sources,
          confidence: ragResult.confidence
        })
      })

      observer.complete()
    } catch (error) {
      observer.next({
        data: JSON.stringify({
          type: 'error',
          message: '生成回答时出现错误'
        })
      })
      observer.error(error)
    }
  }

  private buildSystemPrompt(sources: any[]): string {
    const contextText = sources
      .map(source => source.content)
      .join('\n\n')

    return `
你是一位专业的硬件工程师学习助教，擅长数字电路、模拟电路和嵌入式系统。

请基于以下知识库内容回答用户问题：

${contextText}

回答要求：
1. 基于提供的知识库内容回答，不要编造信息
2. 用通俗易懂的语言解释复杂概念
3. 提供实例和类比帮助理解
4. 如果知识库中没有相关信息，诚实说"不知道"
5. 回答要准确、有条理、易于理解

请用中文回答。
    `.trim()
  }
}
```

## 🎨 前端 AI 组件

### 1. 聊天界面组件

```vue
<!-- apps/web/app/components/ai/ChatInterface.vue -->
<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- 消息列表 -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <MessageBubble
          :message="message"
          :is-streaming="message.id === streamingMessageId"
        />
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white rounded-lg p-4 shadow-sm max-w-xs">
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span class="text-sm text-gray-600">{{ loadingMessage }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="border-t bg-white p-4">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="输入你的问题..."
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isLoading"
        >
        <button
          type="submit"
          :disabled="!inputMessage.trim() || isLoading"
          class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin h-5 w-5" />
          <Icon v-else name="heroicons:paper-airplane" class="h-5 w-5" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    content: string
    metadata: Record<string, any>
    score: number
  }>
  confidence?: number
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const loadingMessage = ref('')
const streamingMessageId = ref<string | null>(null)
const messagesContainer = ref<HTMLElement>()

const { streamChat } = useChat()

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  
  const assistantMessage: Message = {
    id: generateId(),
    role: 'assistant',
    content: '',
    timestamp: new Date()
  }

  messages.value.push(assistantMessage)
  streamingMessageId.value = assistantMessage.id

  const question = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true

  try {
    await streamChat(question, {
      onStart: (message: string) => {
        loadingMessage.value = message
      },
      onSearching: (message: string) => {
        loadingMessage.value = message
      },
      onGenerating: (message: string) => {
        loadingMessage.value = message
        isLoading.value = false
      },
      onContent: (content: string, fullContent: string) => {
        assistantMessage.content = fullContent
        scrollToBottom()
      },
      onComplete: (sources: any[], confidence: number) => {
        assistantMessage.sources = sources
        assistantMessage.confidence = confidence
        streamingMessageId.value = null
        scrollToBottom()
      },
      onError: (error: string) => {
        assistantMessage.content = '抱歉，生成回答时出现错误。'
        streamingMessageId.value = null
        isLoading.value = false
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    assistantMessage.content = '抱歉，发送消息时出现错误。'
    streamingMessageId.value = null
  } finally {
    isLoading.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}
</script>
```

### 2. 流式文本组件

```vue
<!-- apps/web/app/components/ai/StreamingText.vue -->
<template>
  <div class="streaming-text">
    <span v-html="formattedContent"></span>
    <span v-if="isStreaming" class="cursor animate-pulse">|</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  content: string
  isStreaming: boolean
  typewriterEffect?: boolean
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  typewriterEffect: false,
  speed: 50
})

const displayedContent = ref('')
const formattedContent = computed(() => {
  // 简单的 Markdown 渲染
  return props.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    .replace(/\n/g, '<br>')
})

// 打字机效果
watch(() => props.content, (newContent) => {
  if (props.typewriterEffect && props.isStreaming) {
    let index = displayedContent.value.length
    const timer = setInterval(() => {
      if (index < newContent.length) {
        displayedContent.value = newContent.slice(0, index + 1)
        index++
      } else {
        clearInterval(timer)
      }
    }, props.speed)
  } else {
    displayedContent.value = newContent
  }
}, { immediate: true })
</script>

<style scoped>
.streaming-text {
  line-height: 1.6;
}

.cursor {
  color: #3b82f6;
  font-weight: bold;
}

:deep(code) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}
</style>
```

### 3. 聊天 Composable

```typescript
// apps/web/app/composables/useChat.ts
export const useChat = () => {
  const isConnected = ref(false)
  const eventSource = ref<EventSource | null>(null)

  const streamChat = async (
    question: string,
    callbacks: {
      onStart?: (message: string) => void
      onSearching?: (message: string) => void
      onGenerating?: (message: string) => void
      onContent?: (content: string, fullContent: string) => void
      onComplete?: (sources: any[], confidence: number) => void
      onError?: (error: string) => void
    }
  ) => {
    return new Promise<void>((resolve, reject) => {
      // 创建 EventSource 连接
      const url = `/api/ai/chat/stream`
      eventSource.value = new EventSource(url)

      // 发送问题数据
      $fetch('/api/ai/chat/stream', {
        method: 'POST',
        body: { question }
      }).catch(reject)

      eventSource.value.onopen = () => {
        isConnected.value = true
      }

      eventSource.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          switch (data.type) {
            case 'start':
              callbacks.onStart?.(data.message)
              break
            case 'searching':
              callbacks.onSearching?.(data.message)
              break
            case 'generating':
              callbacks.onGenerating?.(data.message)
              break
            case 'content':
              callbacks.onContent?.(data.content, data.fullContent)
              break
            case 'complete':
              callbacks.onComplete?.(data.sources, data.confidence)
              closeConnection()
              resolve()
              break
            case 'error':
              callbacks.onError?.(data.message)
              closeConnection()
              reject(new Error(data.message))
              break
          }
        } catch (error) {
          console.error('Parse SSE data error:', error)
          callbacks.onError?.('数据解析错误')
          closeConnection()
          reject(error)
        }
      }

      eventSource.value.onerror = (error) => {
        console.error('SSE connection error:', error)
        callbacks.onError?.('连接错误')
        closeConnection()
        reject(error)
      }
    })
  }

  const closeConnection = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
    }
  }

  onUnmounted(() => {
    closeConnection()
  })

  return {
    streamChat,
    isConnected: readonly(isConnected),
    closeConnection
  }
}
```

## 📚 知识库管理

### 1. 文档处理服务

```typescript
// apps/backend/src/ai/services/knowledge.service.ts
import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import * as pdfParse from 'pdf-parse'
import * as fs from 'fs'

@Injectable()
export class KnowledgeService {
  private textSplitter: RecursiveCharacterTextSplitter

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '。', '！', '？', '；', ' ', '']
    })
  }

  async processDocument(
    filePath: string,
    metadata: Record<string, any> = {}
  ) {
    const fileExtension = filePath.split('.').pop()?.toLowerCase()
    let content: string

    switch (fileExtension) {
      case 'pdf':
        content = await this.processPDF(filePath)
        break
      case 'md':
      case 'txt':
        content = await this.processText(filePath)
        break
      default:
        throw new Error(`不支持的文件类型: ${fileExtension}`)
    }

    // 分割文档
    const chunks = await this.textSplitter.splitText(content)

    // 为每个块添加元数据
    const documents = chunks.map((chunk, index) => ({
      content: chunk,
      metadata: {
        ...metadata,
        source: filePath,
        chunkIndex: index,
        totalChunks: chunks.length,
        processedAt: new Date().toISOString()
      }
    }))

    return documents
  }

  private async processPDF(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath)
    const data = await pdfParse(buffer)
    return data.text
  }

  private async processText(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8')
  }

  async addDocumentsToVectorStore(
    documents: Array<{
      content: string
      metadata: Record<string, any>
    }>
  ) {
    // 这里调用 RAG 服务添加文档
    const ragService = new (await import('./rag.service')).RAGService()
    await ragService.addDocuments(documents)
  }

  async updateKnowledgeBase(filePaths: string[]) {
    const allDocuments = []

    for (const filePath of filePaths) {
      try {
        const documents = await this.processDocument(filePath, {
          filename: filePath.split('/').pop(),
          uploadedAt: new Date().toISOString()
        })
        allDocuments.push(...documents)
      } catch (error) {
        console.error(`处理文件失败: ${filePath}`, error)
      }
    }

    if (allDocuments.length > 0) {
      await this.addDocumentsToVectorStore(allDocuments)
    }

    return {
      processedFiles: filePaths.length,
      totalDocuments: allDocuments.length
    }
  }
}
```

### 2. 知识库上传组件

```vue
<!-- apps/web/app/components/ai/KnowledgeUpload.vue -->
<template>
  <div class="knowledge-upload">
    <div class="upload-area" :class="{ 'drag-over': isDragOver }">
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".pdf,.md,.txt"
        @change="handleFileSelect"
        class="hidden"
      >
      
      <div
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @click="$refs.fileInput.click()"
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
      >
        <Icon name="heroicons:cloud-arrow-up" class="mx-auto h-12 w-12 text-gray-400" />
        <p class="mt-2 text-sm text-gray-600">
          点击或拖拽文件到此处上传
        </p>
        <p class="text-xs text-gray-500">
          支持 PDF、Markdown、文本文件
        </p>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploadingFiles.length > 0" class="mt-4 space-y-2">
      <div
        v-for="file in uploadingFiles"
        :key="file.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <Icon name="heroicons:document-text" class="h-5 w-5 text-gray-400" />
          <span class="text-sm font-medium">{{ file.name }}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <div v-if="file.status === 'uploading'" class="flex items-center space-x-2">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${file.progress}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500">{{ file.progress }}%</span>
          </div>
          
          <Icon
            v-else-if="file.status === 'completed'"
            name="heroicons:check-circle"
            class="h-5 w-5 text-green-500"
          />
          
          <Icon
            v-else-if="file.status === 'error'"
            name="heroicons:x-circle"
            class="h-5 w-5 text-red-500"
          />
        </div>
      </div>
    </div>

    <!-- 已上传文件列表 -->
    <div v-if="uploadedFiles.length > 0" class="mt-6">
      <h3 class="text-lg font-medium mb-3">知识库文件</h3>
      <div class="space-y-2">
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="flex items-center justify-between p-3 bg-white border rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <Icon name="heroicons:document-text" class="h-5 w-5 text-blue-500" />
            <div>
              <p class="text-sm font-medium">{{ file.name }}</p>
              <p class="text-xs text-gray-500">
                {{ file.chunks }} 个文档块 • {{ formatDate(file.uploadedAt) }}
              </p>
            </div>
          </div>
          
          <button
            @click="deleteFile(file.id)"
            class="text-red-500 hover:text-red-700"
          >
            <Icon name="heroicons:trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UploadingFile {
  id: string
  name: string
  file: File
  status: 'uploading' | 'completed' | 'error'
  progress: number
}

interface UploadedFile {
  id: string
  name: string
  chunks: number
  uploadedAt: Date
}

const isDragOver = ref(false)
const uploadingFiles = ref<UploadingFile[]>([])
const uploadedFiles = ref<UploadedFile[]>([])

const { uploadKnowledgeFile, getKnowledgeFiles, deleteKnowledgeFile } = useKnowledge()

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleFiles = async (files: File[]) => {
  for (const file of files) {
    const uploadingFile: UploadingFile = {
      id: generateId(),
      name: file.name,
      file,
      status: 'uploading',
      progress: 0
    }
    
    uploadingFiles.value.push(uploadingFile)
    
    try {
      await uploadKnowledgeFile(file, {
        onProgress: (progress: number) => {
          uploadingFile.progress = progress
        }
      })
      
      uploadingFile.status = 'completed'
      
      // 刷新文件列表
      await loadKnowledgeFiles()
    } catch (error) {
      uploadingFile.status = 'error'
      console.error('Upload error:', error)
    }
  }
  
  // 清理已完成的上传
  setTimeout(() => {
    uploadingFiles.value = uploadingFiles.value.filter(
      file => file.status === 'uploading'
    )
  }, 2000)
}

const deleteFile = async (fileId: string) => {
  try {
    await deleteKnowledgeFile(fileId)
    await loadKnowledgeFiles()
  } catch (error) {
    console.error('Delete error:', error)
  }
}

const loadKnowledgeFiles = async () => {
  try {
    uploadedFiles.value = await getKnowledgeFiles()
  } catch (error) {
    console.error('Load files error:', error)
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// 初始化加载
onMounted(() => {
  loadKnowledgeFiles()
})
</script>

<style scoped>
.drag-over {
  @apply border-blue-400 bg-blue-50;
}
</style>
```

## 🔧 缓存和优化

### 1. 智能缓存策略

```typescript
// apps/backend/src/ai/services/cache.service.ts
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'
import * as crypto from 'crypto'

@Injectable()
export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL)
  }

  // 生成缓存键
  private generateCacheKey(question: string, context?: string): string {
    const content = context ? `${question}:${context}` : question
    return `ai:cache:${crypto.createHash('md5').update(content).digest('hex')}`
  }

  // 检查相似问题
  async findSimilarQuestion(
    question: string,
    threshold: number = 0.85
  ): Promise<{ answer: string; confidence: number } | null> {
    const questionEmbedding = await this.generateEmbedding(question)
    
    // 从缓存中获取所有问题的向量
    const cachedQuestions = await this.redis.hgetall('ai:questions')
    
    let bestMatch = null
    let bestSimilarity = 0

    for (const [cachedQuestion, data] of Object.entries(cachedQuestions)) {
      const cachedData = JSON.parse(data)
      const similarity = this.cosineSimilarity(
        questionEmbedding,
        cachedData.embedding
      )

      if (similarity > bestSimilarity && similarity >= threshold) {
        bestSimilarity = similarity
        bestMatch = {
          answer: cachedData.answer,
          confidence: similarity
        }
      }
    }

    return bestMatch
  }

  // 缓存问答对
  async cacheQA(
    question: string,
    answer: string,
    embedding: number[],
    ttl: number = 86400 // 24小时
  ) {
    const cacheKey = this.generateCacheKey(question)
    
    const data = {
      question,
      answer,
      embedding,
      timestamp: Date.now()
    }

    await Promise.all([
      // 缓存完整回答
      this.redis.setex(cacheKey, ttl, JSON.stringify(data)),
      // 缓存问题向量用于相似性搜索
      this.redis.hset('ai:questions', question, JSON.stringify(data))
    ])
  }

  // 获取缓存的回答
  async getCachedAnswer(question: string): Promise<string | null> {
    const cacheKey = this.generateCacheKey(question)
    const cached = await this.redis.get(cacheKey)
    
    if (cached) {
      const data = JSON.parse(cached)
      return data.answer
    }
    
    return null
  }

  // 余弦相似度计算
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // 生成向量（这里应该调用 LLM 服务）
  private async generateEmbedding(text: string): Promise<number[]> {
    // 实际实现中应该调用 LLMService
    // 这里返回模拟数据
    return new Array(1536).fill(0).map(() => Math.random())
  }

  // 清理过期缓存
  async cleanupExpiredCache() {
    const questions = await this.redis.hgetall('ai:questions')
    const now = Date.now()
    const expiredQuestions = []

    for (const [question, data] of Object.entries(questions)) {
      const parsedData = JSON.parse(data)
      // 清理超过7天的缓存
      if (now - parsedData.timestamp > 7 * 24 * 60 * 60 * 1000) {
        expiredQuestions.push(question)
      }
    }

    if (expiredQuestions.length > 0) {
      await this.redis.hdel('ai:questions', ...expiredQuestions)
    }

    return expiredQuestions.length
  }
}
```

### 2. 成本控制策略

```typescript
// apps/backend/src/ai/services/cost-control.service.ts
import { Injectable } from '@nestjs/common'

@Injectable()
export class CostControlService {
  private readonly DAILY_LIMITS = {
    free: { requests: 10, tokens: 10000 },
    pro: { requests: 100, tokens: 100000 },
    enterprise: { requests: 1000, tokens: 1000000 }
  }

  async checkUserLimits(
    userId: string,
    userPlan: 'free' | 'pro' | 'enterprise'
  ): Promise<{ allowed: boolean; remaining: any }> {
    const today = new Date().toISOString().split('T')[0]
    const key = `usage:${userId}:${today}`
    
    const usage = await this.redis.hgetall(key)
    const currentRequests = parseInt(usage.requests || '0')
    const currentTokens = parseInt(usage.tokens || '0')
    
    const limits = this.DAILY_LIMITS[userPlan]
    
    const allowed = currentRequests < limits.requests && currentTokens < limits.tokens
    
    return {
      allowed,
      remaining: {
        requests: Math.max(0, limits.requests - currentRequests),
        tokens: Math.max(0, limits.tokens - currentTokens)
      }
    }
  }

  async recordUsage(
    userId: string,
    tokens: number
  ) {
    const today = new Date().toISOString().split('T')[0]
    const key = `usage:${userId}:${today}`
    
    await Promise.all([
      this.redis.hincrby(key, 'requests', 1),
      this.redis.hincrby(key, 'tokens', tokens),
      this.redis.expire(key, 86400) // 24小时过期
    ])
  }

  // 智能模型选择
  selectModel(
    question: string,
    userPlan: 'free' | 'pro' | 'enterprise'
  ): 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3' {
    const questionLength = question.length
    const complexity = this.analyzeComplexity(question)

    // 免费用户只能使用 GPT-3.5
    if (userPlan === 'free') {
      return 'gpt-3.5-turbo'
    }

    // 根据问题复杂度选择模型
    if (complexity > 0.8 || questionLength > 1000) {
      return userPlan === 'enterprise' ? 'claude-3' : 'gpt-4'
    }

    return 'gpt-3.5-turbo'
  }

  private analyzeComplexity(question: string): number {
    // 简单的复杂度分析
    const complexKeywords = [
      '设计', '分析', '计算', '推导', '证明', '优化',
      'design', 'analyze', 'calculate', 'derive', 'prove'
    ]
    
    const hasComplexKeywords = complexKeywords.some(keyword =>
      question.toLowerCase().includes(keyword)
    )
    
    const hasMultipleQuestions = (question.match(/[？?]/g) || []).length > 1
    const hasCodeBlocks = question.includes('```')
    
    let complexity = 0.3 // 基础复杂度
    
    if (hasComplexKeywords) complexity += 0.3
    if (hasMultipleQuestions) complexity += 0.2
    if (hasCodeBlocks) complexity += 0.2
    if (question.length > 500) complexity += 0.2
    
    return Math.min(complexity, 1.0)
  }
}
```

## 📊 监控和分析

### 1. AI 使用统计

```typescript
// apps/backend/src/ai/services/analytics.service.ts
import { Injectable } from '@nestjs/common'

@Injectable()
export class AIAnalyticsService {
  async recordInteraction(data: {
    userId: string
    question: string
    answer: string
    model: string
    tokensUsed: number
    responseTime: number
    confidence: number
    sources: number
    satisfied?: boolean
  }) {
    // 记录到数据库
    await this.prisma.aiInteraction.create({
      data: {
        userId: data.userId,
        question: data.question,
        answer: data.answer,
        model: data.model,
        tokensUsed: data.tokensUsed,
        responseTime: data.responseTime,
        confidence: data.confidence,
        sourcesCount: data.sources,
        satisfied: data.satisfied,
        timestamp: new Date()
      }
    })

    // 更新实时统计
    await this.updateRealTimeStats(data)
  }

  private async updateRealTimeStats(data: any) {
    const today = new Date().toISOString().split('T')[0]
    
    await Promise.all([
      // 总请求数
      this.redis.incr(`stats:requests:${today}`),
      // 按模型统计
      this.redis.incr(`stats:model:${data.model}:${today}`),
      // 平均响应时间
      this.redis.lpush(`stats:response_time:${today}`, data.responseTime),
      // 平均置信度
      this.redis.lpush(`stats:confidence:${today}`, data.confidence)
    ])
  }

  async getDashboardStats(days: number = 7) {
    const stats = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const [requests, responseTimes, confidences] = await Promise.all([
        this.redis.get(`stats:requests:${dateStr}`),
        this.redis.lrange(`stats:response_time:${dateStr}`, 0, -1),
        this.redis.lrange(`stats:confidence:${dateStr}`, 0, -1)
      ])
      
      stats.push({
        date: dateStr,
        requests: parseInt(requests || '0'),
        avgResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((sum, time) => sum + parseFloat(time), 0) / responseTimes.length
          : 0,
        avgConfidence: confidences.length > 0
          ? confidences.reduce((sum, conf) => sum + parseFloat(conf), 0) / confidences.length
          : 0
      })
    }
    
    return stats.reverse()
  }
}
```

## 🎯 总结

这套 AI 集成方案具有以下优势：

1. **架构完整**: RAG + LangChain + 向量数据库完整方案
2. **性能优化**: 智能缓存 + 相似问题匹配 + 流式响应
3. **成本控制**: 用户限额 + 智能模型选择 + 结果缓存
4. **用户体验**: 实时流式输出 + 打字机效果 + 来源展示
5. **可扩展性**: 模块化设计 + 多模型支持 + 插件机制
6. **监控完善**: 使用统计 + 质量分析 + 成本追踪

适用于需要集成 AI 问答、知识库检索、智能助手等功能的应用项目。