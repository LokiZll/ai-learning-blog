---
title: "Marqo 电商向量搜索方案"
description: "利用向量搜索技术提升电商搜索和推荐效果"
category: "case-studies"
tags: ["向量搜索", "Marqo", "电商搜索", "Embedding"]
date: 2026-03-20
---

## 项目背景

一家时尚电商平台的搜索系统使用传统 Elasticsearch 方案，但面临严峻挑战：用户搜索"红色碎花连衣裙"时，系统只能精确匹配关键词，无法理解语义相关性，导致搜索结果与用户意图相差甚远。搜索转化率仅为 12%，远低于行业平均水平。我们采用 Marqo 向量搜索引擎重建了搜索系统，实现了语义级别的搜索能力。

### 原有系统问题

1. **同义词处理困难**："裙子"和"连衣裙"无法关联
2. **拼写错误脆弱**：用户拼错字就无法找到结果
3. **长尾查询效果差**：小众品类搜索质量不稳定
4. **无法理解意图**：无法区分"男士运动鞋"和"女士运动鞋"

## Marqo 方案设计

### 为什么选择 Marqo

| 特性 | Elasticsearch | Marqo |
|------|---------------|-------|
| 向量搜索 | 需额外插件 | 原生支持 |
| 语义理解 | 无 | 集成多种 Embedding 模型 |
| 部署复杂度 | 高 | 简单 (Docker) |
| 实时索引 | 支持 | 支持 |
| 混合搜索 | 基础 | 高级 (Learning to Rank) |

### 系统架构

```
┌─────────────────────────────────────────┐
│           搜索请求流程                   │
├─────────────────────────────────────────┤
│  用户输入: "春季轻薄外套女"              │
│            ↓                            │
│  Query Understanding                    │
│  ├── 意图识别 (搜索/筛选/导航)           │
│  ├── 查询改写 (同义词扩展)               │
│  └── 向量化 (text-embedding-ada-002)     │
│            ↓                            │
│  Marqo 向量搜索                         │
│  ├── 向量相似度计算 (HNSW)               │
│  ├── 关键词匹配 (BM25)                   │
│  └── 分数融合 (RRF + Learning to Rank)   │
│            ↓                            │
│  返回排序结果                           │
└─────────────────────────────────────────┘
```

## 核心实现

### 商品向量化

```python
# 商品Embedding生成
import marqo
from openai import OpenAI

class ProductVectorizer:
    def __init__(self):
        self.client = OpenAI()
        self.marqo_client = marqo.Client(url='http://localhost:8882')

    def create_product_text(self, product):
        """构建商品描述文本"""
        return f"""
        {product['title']}
        品牌: {product['brand']}
        分类: {product['category']} > {product['sub_category']}
        特点: {', '.join(product['features'])}
        描述: {product['description']}
        风格: {product['style']}
        适用场景: {product['scene']}
        """

    def vectorize_products(self, products):
        """批量向量化商品"""
        for product in products:
            text = self.create_product_text(product)

            # 使用 OpenAI Embedding
            response = self.client.embeddings.create(
                model="text-embedding-3-large",
                input=text
            )
            embedding = response.data[0].embedding

            # 索引到 Marqo
            self.marqo_client.index("products").add_documents([{
                "id": product['id'],
                "title": product['title'],
                "brand": product['brand'],
                "category": product['category'],
                "price": product['price'],
                "embedding": embedding,
                "_tensor_fields": ["embedding"]
            }])

            print(f"已索引: {product['title']}")
```

### 语义搜索实现

```python
# 语义搜索API
class SemanticSearchAPI:
    def __init__(self):
        self.marqo_client = marqo.Client(url='http://localhost:8882')
        self.index = self.marqo_client.index("products")

    def search(self, query, filters=None, limit=20):
        """语义搜索"""

        # 查询向量化
        response = OpenAI().embeddings.create(
            model="text-embedding-3-large",
            input=query
        )
        query_vector = response.data[0].embedding

        # 混合搜索配置
        search_params = {
            "limit": limit,
            "searchable_attributes": [
                "title",
                "brand",
                "category",
                "features",
                "description"
            ],
            "retrieval_method": "hybrid",
            "ranking_options": {
                "rank": "RRF",
                "alpha": 0.7  # 0.7 向量 + 0.3 关键词
            }
        }

        # 添加筛选条件
        if filters:
            filter_string = self._build_filter(filters)
            search_params["filter"] = filter_string

        # 执行搜索
        results = self.index.search(
            query_vector=query_vector,
            **search_params
        )

        return self._format_results(results)

    def _build_filter(self, filters):
        """构建筛选条件"""
        conditions = []
        if 'category' in filters:
            conditions.append(f"category:'{filters['category']}'")
        if 'brand' in filters:
            conditions.append(f"brand:'{filters['brand']}'")
        if 'price_range' in filters:
            min_price, max_price = filters['price_range']
            conditions.append(f"price:{min_price} TO {max_price}")
        return " AND ".join(conditions)
```

### 同义词扩展

```python
# 同义词词典 + 查询扩展
class SynonymExpander:
    def __init__(self):
        self.synonym_dict = {
            "裙子": ["连衣裙", "半身裙", "裙装"],
            "运动鞋": ["跑步鞋", "休闲鞋", "帆布鞋"],
            "轻薄": ["轻薄", "超薄", "透气"],
            "春季": ["春天", "春夏", "换季"]
        }

    def expand(self, query):
        """扩展查询词"""
        words = query.split()
        expanded = [query]  # 保留原始查询

        for word in words:
            if word in self.synonym_dict:
                for syn in self.synonym_dict[word]:
                    expanded.append(query.replace(word, syn))

        return expanded
```

## 应用效果

### 搜索质量提升

| 指标 | 实施前 | 实施后 | 提升 |
|------|--------|--------|------|
| 搜索转化率 | 12% | 28% | +133% |
| 首条结果点击率 | 22% | 51% | +132% |
| 无结果率 | 18% | 3% | -83% |
| 平均搜索词长度 | 2.1 | 4.3 | +105% |

### 用户行为变化

1. **搜索意愿提升**：用户更愿意输入更长的查询词
2. **筛选使用减少**：语义理解减少了手动筛选需求
3. **加购率提高**：搜索结果相关性提高，加购率上升 45%

## 挑战与解决

### 向量索引延迟

**挑战**：商品更新后需要重新生成向量，延迟影响体验

**解决方案**：
- 增量更新：只对变更商品重新向量化
- 异步索引：更新请求立即返回，后台异步处理
- 缓存预热：热门商品预先向量化

### 成本控制

**挑战**：向量存储和计算资源消耗大

**解决方案**：
- 商品分层：热销商品使用高精度向量，长尾商品使用压缩向量
- 冷热分离：历史数据迁移到低成本存储
- 按需索引：只对有搜索价值的字段构建向量

## 经验启示

1. **商品文本质量是关键**：向量化效果取决于输入文本的质量，需要精心设计商品描述
2. **混合搜索效果更好**：向量和关键词结合能覆盖更多场景
3. **持续优化同义词库**：用户搜索词是持续变化的，同义词库需要不断更新
4. **A/B 测试验证效果**：搜索是敏感功能，重大变更需要 A/B 测试验证

> Marqo 让电商搜索从"关键词匹配"升级到"语义理解"，这是搜索体验的质变，也是电商竞争力的重要来源。
