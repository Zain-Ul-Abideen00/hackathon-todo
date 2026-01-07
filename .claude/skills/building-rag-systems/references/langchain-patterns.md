# LangChain RAG Patterns

Production-grade RAG implementation using LangChain orchestration with Qdrant vector store.

## Quick Start

```bash
# Install dependencies
pip install langchain langchain-qdrant langchain-openai langchain-text-splitters
pip install qdrant-client fastembed  # For hybrid search

# Start Qdrant with Docker
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

---

## Document Loading

### WebBaseLoader (HTML)

```python
import bs4
from langchain_community.document_loaders import WebBaseLoader

bs4_strainer = bs4.SoupStrainer(class_=("post-content", "post-title"))
loader = WebBaseLoader(
    web_paths=("https://example.com/article",),
    bs_kwargs={"parse_only": bs4_strainer},
)
docs = loader.load()
```

### PyPDFLoader (PDF)

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("document.pdf")
docs = loader.load()
```

### TextLoader (Plain Text)

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("file.txt", encoding="utf-8")
docs = loader.load()
```

### DirectoryLoader (Multiple Files)

```python
from langchain_community.document_loaders import DirectoryLoader, TextLoader

loader = DirectoryLoader(
    "./documents/",
    glob="**/*.md",
    loader_cls=TextLoader,
    loader_kwargs={"encoding": "utf-8"},
)
docs = loader.load()
```

---

## Text Splitting

### RecursiveCharacterTextSplitter (Recommended)

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,           # Target chunk size in characters
    chunk_overlap=200,         # Overlap for context continuity
    add_start_index=True,      # Track position in source
    separators=["\n\n", "\n", " ", ""],  # Split hierarchy
)
all_splits = text_splitter.split_documents(docs)
```

### Markdown Header Splitter (Semantic)

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
splits = splitter.split_text(markdown_doc)
```

---

## Qdrant Vector Store

### In-Memory (Testing)

```python
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # 1536 dims

client = QdrantClient(":memory:")
client.create_collection(
    collection_name="task_api_docs",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)

vector_store = QdrantVectorStore(
    client=client,
    collection_name="task_api_docs",
    embedding=embeddings,
)
```

### Docker/Server (Production)

```python
from langchain_qdrant import QdrantVectorStore

vector_store = QdrantVectorStore.from_documents(
    docs,
    embeddings,
    url="http://localhost:6333",
    collection_name="task_api_docs",
)
```

### From Existing Collection

```python
vector_store = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name="task_api_docs",
    url="http://localhost:6333",
)
```

### Hybrid Search (Dense + Sparse)

```python
from langchain_qdrant import FastEmbedSparse, QdrantVectorStore, RetrievalMode
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import Distance, SparseVectorParams, VectorParams

sparse_embeddings = FastEmbedSparse(model_name="Qdrant/bm25")

client = QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="task_api_hybrid",
    vectors_config={"dense": VectorParams(size=1536, distance=Distance.COSINE)},
    sparse_vectors_config={
        "sparse": SparseVectorParams(index=models.SparseIndexParams(on_disk=False))
    },
)

vector_store = QdrantVectorStore(
    client=client,
    collection_name="task_api_hybrid",
    embedding=embeddings,
    sparse_embedding=sparse_embeddings,
    retrieval_mode=RetrievalMode.HYBRID,
    vector_name="dense",
    sparse_vector_name="sparse",
)
```

---

## Retrieval Patterns

### Basic Similarity Search

```python
results = vector_store.similarity_search("How do I create a task?", k=4)
for doc in results:
    print(f"Source: {doc.metadata.get('source')}")
    print(doc.page_content[:200])
```

### Similarity Search with Scores

```python
results = vector_store.similarity_search_with_score("task completion", k=4)
for doc, score in results:
    print(f"Score: {score:.3f} | {doc.page_content[:100]}")
```

### As Retriever

```python
retriever = vector_store.as_retriever(
    search_type="mmr",  # Maximum Marginal Relevance for diversity
    search_kwargs={
        "k": 4,
        "fetch_k": 20,      # Fetch more, then select diverse
        "lambda_mult": 0.5,  # Balance relevance vs diversity
    },
)
docs = retriever.invoke("task management workflow")
```

### Metadata Filtering

```python
from qdrant_client import models

results = vector_store.similarity_search(
    query="How to complete tasks?",
    k=4,
    filter=models.Filter(
        must=[
            models.FieldCondition(
                key="metadata.chapter",
                range=models.Range(gte=40, lte=43),
            ),
        ]
    ),
)
```

---

## Retrieval Chains

### Simple QA Chain

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
retriever = vector_store.as_retriever(search_kwargs={"k": 4})

prompt = ChatPromptTemplate.from_template("""
Answer the question based only on the following context:

{context}

Question: {question}

Answer concisely and cite your sources.
""")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

chain = (
    {"context": retriever | format_docs, "question": lambda x: x}
    | prompt
    | llm
)

response = chain.invoke("How do I mark a task as complete?")
```

### Retrieval as Tool (Agentic)

```python
from langchain.tools import tool

@tool(response_format="content_and_artifact")
def search_task_docs(query: str):
    """Search Task API documentation for answers."""
    docs = vector_store.similarity_search(query, k=4)
    serialized = "\n\n".join(
        f"Source: {doc.metadata.get('source', 'unknown')}\n{doc.page_content}"
        for doc in docs
    )
    return serialized, docs
```

---

## Task API RAG Example

### Indexing Task Descriptions

```python
from langchain_core.documents import Document
from uuid import uuid4

# Sample task data from Task API
tasks = [
    {"id": 1, "title": "Setup Docker", "description": "Install and configure Docker..."},
    {"id": 2, "title": "Deploy API", "description": "Deploy FastAPI application..."},
]

documents = [
    Document(
        page_content=f"Task: {task['title']}\n\n{task['description']}",
        metadata={"task_id": task["id"], "title": task["title"]},
    )
    for task in tasks
]

uuids = [str(uuid4()) for _ in documents]
vector_store.add_documents(documents=documents, ids=uuids)
```

### Semantic Task Search

```python
def search_tasks(query: str, k: int = 5):
    """Search tasks by semantic meaning."""
    results = vector_store.similarity_search_with_score(query, k=k)
    return [
        {
            "task_id": doc.metadata.get("task_id"),
            "title": doc.metadata.get("title"),
            "relevance": float(score),
            "snippet": doc.page_content[:200],
        }
        for doc, score in results
    ]

# Find tasks related to deployment
results = search_tasks("container orchestration")
```

---

## Dependencies Summary

```python
# Core
langchain>=0.3.0
langchain-openai>=0.2.0
langchain-qdrant>=0.2.0
langchain-text-splitters>=0.3.0

# Optional
langchain-community>=0.3.0  # Document loaders
fastembed>=0.4.0            # Sparse embeddings
bs4>=4.12.0                 # HTML parsing
pypdf>=5.0.0                # PDF loading
```

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Use fixed character splits | Use RecursiveCharacterTextSplitter |
| Skip overlap between chunks | Set chunk_overlap=10-20% of chunk_size |
| Ignore metadata | Attach source, page, section to docs |
| Use in-memory for production | Use Qdrant Docker/Cloud |
| Hardcode k=10 for all queries | Tune k based on use case |
| Skip score filtering | Set minimum similarity threshold |

---

## Related References

- [retrieval-patterns.md](retrieval-patterns.md) - Filter strategies, context expansion
- [ingestion-patterns.md](ingestion-patterns.md) - Full pipeline implementation
- [rag-architectures.md](rag-architectures.md) - Advanced patterns (HyDE, CRAG, Self-RAG)
- [evaluation-patterns.md](evaluation-patterns.md) - LangSmith + RAGAS integration
