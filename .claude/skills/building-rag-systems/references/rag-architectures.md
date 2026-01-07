# Advanced RAG Architectures

Eight RAG patterns from simple to agentic, with LangChain/LangGraph implementations.

---

## 1. Simple RAG

Basic retrieval → generation pipeline. Best for static knowledge bases.

```
Query → Embed → Search → Retrieve Top-K → Generate Answer
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
retriever = vector_store.as_retriever(search_kwargs={"k": 4})

prompt = ChatPromptTemplate.from_template("""
Answer based on this context:
{context}

Question: {question}
""")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

chain = (
    {"context": retriever | format_docs, "question": lambda x: x}
    | prompt
    | llm
)
```

**Use when**: FAQ systems, product manuals, known-scope knowledge bases.

---

## 2. Simple RAG with Memory

Adds conversation history for multi-turn context.

```
Query + History → Contextualize → Embed → Search → Generate
```

```python
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

contextualize_prompt = ChatPromptTemplate.from_messages([
    ("system", "Given chat history, reformulate the question to be standalone."),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])

def contextualize_question(state):
    if state.get("chat_history"):
        # Reformulate question with context
        return contextualize_chain.invoke(state)
    return state["input"]

# Chain with history-aware retrieval
history_aware_retriever = create_history_aware_retriever(
    llm, retriever, contextualize_prompt
)
```

**Use when**: Customer support chatbots, personalized recommendations.

---

## 3. Branched RAG (Router RAG)

Routes queries to specialized retrievers based on intent.

```
Query → Classify Intent → Route to Retriever → Generate
```

```python
from langchain_core.output_parsers import StrOutputParser

router_prompt = ChatPromptTemplate.from_template("""
Classify query into one of: task_api, deployment, debugging

Query: {query}
Category:""")

router_chain = router_prompt | llm | StrOutputParser()

retrievers = {
    "task_api": task_api_retriever,
    "deployment": deployment_retriever,
    "debugging": debugging_retriever,
}

def route_and_retrieve(query: str):
    category = router_chain.invoke({"query": query}).strip().lower()
    retriever = retrievers.get(category, task_api_retriever)
    return retriever.invoke(query)
```

**Use when**: Multi-domain knowledge bases, specialized search needs.

---

## 4. HyDE (Hypothetical Document Embeddings)

Generates hypothetical answer first, uses it for retrieval.

```
Query → Generate Hypothetical Doc → Embed Hypothetical → Search → Generate Final
```

```python
from langchain_core.prompts import ChatPromptTemplate

hyde_prompt = ChatPromptTemplate.from_template("""
Write a detailed passage that would answer this question:
{question}

Passage:""")

def hyde_retrieve(question: str, k: int = 4):
    # Generate hypothetical document
    hypothetical = (hyde_prompt | llm).invoke({"question": question})

    # Use hypothetical for retrieval
    docs = vector_store.similarity_search(hypothetical.content, k=k)
    return docs

# Use in chain
def hyde_chain(question: str):
    docs = hyde_retrieve(question)
    context = "\n\n".join(doc.page_content for doc in docs)
    return qa_prompt.invoke({"context": context, "question": question})
```

**Use when**: Vague queries, research systems, abstract questions.

---

## 5. Adaptive RAG

Adjusts retrieval strategy based on query complexity.

```
Query → Analyze Complexity → Choose Strategy → Execute → Generate
```

```python
from enum import Enum

class QueryComplexity(Enum):
    SIMPLE = "simple"      # Direct retrieval
    MODERATE = "moderate"  # Multi-source
    COMPLEX = "complex"    # Iterative + web

def analyze_complexity(query: str) -> QueryComplexity:
    analysis_prompt = ChatPromptTemplate.from_template("""
    Classify query complexity:
    - SIMPLE: factual, single-source answer
    - MODERATE: needs multiple sources
    - COMPLEX: needs reasoning, external sources

    Query: {query}
    Complexity:""")
    result = (analysis_prompt | llm).invoke({"query": query})
    return QueryComplexity(result.content.strip().lower())

def adaptive_retrieve(query: str):
    complexity = analyze_complexity(query)

    if complexity == QueryComplexity.SIMPLE:
        return retriever.invoke(query)[:2]
    elif complexity == QueryComplexity.MODERATE:
        return retriever.invoke(query)[:5]
    else:  # COMPLEX
        docs = retriever.invoke(query)[:5]
        # Add web search for complex queries
        web_results = web_search_tool.invoke(query)
        return docs + web_results
```

**Use when**: Enterprise search, variable query complexity.

---

## 6. Corrective RAG (CRAG)

Grades retrieved documents, falls back to web search if low quality.

```
Query → Retrieve → Grade Relevance → [If Low] Web Search → Filter → Generate
```

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Literal

class CRAGState(TypedDict):
    question: str
    documents: List
    grade: Literal["relevant", "not_relevant"]
    generation: str

def grade_documents(state: CRAGState) -> CRAGState:
    """Grade retrieved documents for relevance."""
    grader_prompt = ChatPromptTemplate.from_template("""
    Is this document relevant to the question?
    Document: {document}
    Question: {question}
    Answer (yes/no):""")

    docs = state["documents"]
    filtered = []
    for doc in docs:
        result = (grader_prompt | llm).invoke({
            "document": doc.page_content,
            "question": state["question"]
        })
        if "yes" in result.content.lower():
            filtered.append(doc)

    grade = "relevant" if len(filtered) >= 2 else "not_relevant"
    return {**state, "documents": filtered, "grade": grade}

def web_search(state: CRAGState) -> CRAGState:
    """Fall back to web search for low-quality retrieval."""
    results = web_search_tool.invoke(state["question"])
    return {**state, "documents": state["documents"] + results}

def decide_next(state: CRAGState) -> str:
    return "web_search" if state["grade"] == "not_relevant" else "generate"

# Build graph
workflow = StateGraph(CRAGState)
workflow.add_node("retrieve", retrieve_docs)
workflow.add_node("grade", grade_documents)
workflow.add_node("web_search", web_search)
workflow.add_node("generate", generate_answer)

workflow.add_edge("retrieve", "grade")
workflow.add_conditional_edges("grade", decide_next)
workflow.add_edge("web_search", "generate")
workflow.add_edge("generate", END)
```

**Use when**: High accuracy requirements, legal, medical, financial.

---

## 7. Self-RAG

Self-retrieves during generation when gaps detected.

```
Query → Retrieve → Generate + Self-Assess → [If Gaps] Re-Retrieve → Refine
```

```python
class SelfRAGState(TypedDict):
    question: str
    documents: List
    generation: str
    is_supported: bool
    iteration: int

def assess_generation(state: SelfRAGState) -> SelfRAGState:
    """Check if generation is supported by documents."""
    assess_prompt = ChatPromptTemplate.from_template("""
    Is this answer fully supported by the documents?

    Documents: {documents}
    Answer: {generation}

    Respond with:
    - SUPPORTED: answer is grounded in documents
    - GAPS: answer has unsupported claims
    - INSUFFICIENT: need more information

    Assessment:""")

    docs_text = "\n".join(d.page_content for d in state["documents"])
    result = (assess_prompt | llm).invoke({
        "documents": docs_text,
        "generation": state["generation"]
    })

    is_supported = "SUPPORTED" in result.content.upper()
    return {**state, "is_supported": is_supported}

def self_retrieve(state: SelfRAGState) -> SelfRAGState:
    """Generate new query from identified gaps."""
    gap_prompt = ChatPromptTemplate.from_template("""
    What information is missing to answer this question?
    Question: {question}
    Current answer: {generation}

    Generate a search query to fill the gap:""")

    new_query = (gap_prompt | llm).invoke(state)
    new_docs = retriever.invoke(new_query.content)

    return {
        **state,
        "documents": state["documents"] + new_docs,
        "iteration": state["iteration"] + 1
    }

def decide_next(state: SelfRAGState) -> str:
    if state["is_supported"] or state["iteration"] >= 3:
        return END
    return "self_retrieve"
```

**Use when**: Research assistants, long-form content, exploratory queries.

---

## 8. Agentic RAG

Full agent with tools, planning, and multi-step reasoning.

```
Query → Agent Plan → [Select Tools] → Execute → Synthesize → Validate → Respond
```

```python
from langgraph.prebuilt import create_react_agent
from langchain.tools import tool

@tool
def search_task_api(query: str) -> str:
    """Search Task API documentation."""
    docs = task_api_retriever.invoke(query)
    return "\n\n".join(d.page_content for d in docs[:3])

@tool
def search_deployment_docs(query: str) -> str:
    """Search deployment and Docker documentation."""
    docs = deployment_retriever.invoke(query)
    return "\n\n".join(d.page_content for d in docs[:3])

@tool
def web_search(query: str) -> str:
    """Search the web for current information."""
    return web_search_tool.invoke(query)

# Create agentic RAG
tools = [search_task_api, search_deployment_docs, web_search]
agent = create_react_agent(
    llm,
    tools,
    system_message="""You are a Task API expert assistant.
    Use tools to find accurate information before answering.
    Always cite your sources."""
)

# Run
response = agent.invoke({"messages": [("user", "How do I deploy Task API to Kubernetes?")]})
```

**Use when**: Complex multi-step queries, automated research, decision support.

---

## Architecture Comparison

| Architecture | Retrieval | Generation | Best For |
|-------------|-----------|------------|----------|
| Simple RAG | Single | Single | FAQ, known scope |
| +Memory | Context-aware | Single | Conversations |
| Branched | Routed | Single | Multi-domain |
| HyDE | Hypothesis-guided | Single | Vague queries |
| Adaptive | Dynamic | Single | Variable complexity |
| CRAG | +Fallback | +Grading | High accuracy |
| Self-RAG | Iterative | +Self-assess | Research |
| Agentic | Multi-tool | Multi-step | Complex reasoning |

---

## Implementation Progression

1. **Start with Simple RAG** - Get baseline working
2. **Add Memory** - For conversational use cases
3. **Add Grading (CRAG)** - For accuracy-critical applications
4. **Go Agentic** - For complex, multi-step requirements

---

## LangGraph Patterns

All advanced patterns (CRAG, Self-RAG, Agentic) use LangGraph for:
- **State management**: TypedDict for typed state
- **Conditional edges**: Dynamic routing based on assessment
- **Cycles**: Iteration for self-improvement
- **Tool integration**: Clean tool node handling

```python
from langgraph.graph import StateGraph, END

workflow = StateGraph(MyState)
workflow.add_node("retrieve", retrieve_fn)
workflow.add_node("grade", grade_fn)
workflow.add_conditional_edges("grade", route_fn)
workflow.set_entry_point("retrieve")
app = workflow.compile()
```

---

## Related References

- [langchain-patterns.md](langchain-patterns.md) - Basic LangChain setup
- [evaluation-patterns.md](evaluation-patterns.md) - How to evaluate these architectures
- [ingestion-patterns.md](ingestion-patterns.md) - Document processing pipeline
