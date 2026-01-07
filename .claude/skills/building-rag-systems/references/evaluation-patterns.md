# RAG Evaluation Patterns

Comprehensive evaluation framework using LangSmith and RAGAS metrics.

---

## Four Evaluation Dimensions

RAG evaluation requires measuring multiple aspects, not just final answer quality.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      RAG Evaluation Framework                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. RETRIEVAL QUALITY                2. GENERATION QUALITY           │
│  ├── Context Precision               ├── Faithfulness                │
│  ├── Context Recall                  ├── Answer Relevance            │
│  └── Retrieval Relevance             └── Answer Correctness          │
│                                                                      │
│  3. END-TO-END                       4. SYSTEM PERFORMANCE           │
│  ├── Groundedness                    ├── Latency                     │
│  ├── Answer Similarity               ├── Token Usage                 │
│  └── Semantic Similarity             └── Cost per Query              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## LangSmith Setup

### Environment Configuration

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
export LANGCHAIN_API_KEY="your-api-key"
export LANGCHAIN_PROJECT="task-api-rag-eval"
```

### Traceable Decorator

```python
from langsmith import traceable

@traceable(name="rag_pipeline")
def rag_pipeline(question: str) -> dict:
    """RAG pipeline with automatic tracing."""
    # Retrieve
    docs = retriever.invoke(question)

    # Generate
    context = "\n\n".join(doc.page_content for doc in docs)
    response = llm.invoke(qa_prompt.format(context=context, question=question))

    return {
        "question": question,
        "context": context,
        "answer": response.content,
        "sources": [doc.metadata.get("source") for doc in docs],
    }
```

---

## LLM-as-Judge Evaluators

### 1. Correctness Evaluator

Compares response to reference answer.

```python
from typing import TypedDict
from langchain_openai import ChatOpenAI

class CorrectnessGrade(TypedDict):
    explanation: str
    is_correct: bool

evaluator_llm = ChatOpenAI(model="gpt-4o", temperature=0).with_structured_output(
    CorrectnessGrade, method="json_schema", strict=True
)

CORRECTNESS_PROMPT = """
Compare the AI response to the reference answer.

Reference: {reference}
AI Response: {response}

Is the AI response factually correct and complete?
Provide explanation and boolean is_correct.
"""

def evaluate_correctness(
    inputs: dict,
    outputs: dict,
    reference_outputs: dict
) -> bool:
    grade = evaluator_llm.invoke([
        {"role": "system", "content": "You are a precise grading assistant."},
        {"role": "user", "content": CORRECTNESS_PROMPT.format(
            reference=reference_outputs.get("answer", ""),
            response=outputs.get("answer", "")
        )}
    ])
    return grade["is_correct"]
```

### 2. Groundedness Evaluator

Checks if response is grounded in retrieved context.

```python
class GroundednessGrade(TypedDict):
    explanation: str
    is_grounded: bool

GROUNDEDNESS_PROMPT = """
Verify that the response is fully supported by the context.

Context: {context}
Response: {response}

Is every claim in the response supported by the context?
Mark as NOT grounded if the response includes information not in the context.
"""

def evaluate_groundedness(inputs: dict, outputs: dict) -> bool:
    grade = evaluator_llm.invoke([
        {"role": "system", "content": "You detect hallucinations."},
        {"role": "user", "content": GROUNDEDNESS_PROMPT.format(
            context=outputs.get("context", ""),
            response=outputs.get("answer", "")
        )}
    ])
    return grade["is_grounded"]
```

### 3. Relevance Evaluator

Checks if response addresses the question.

```python
class RelevanceGrade(TypedDict):
    explanation: str
    is_relevant: bool

RELEVANCE_PROMPT = """
Does the response directly address the question?

Question: {question}
Response: {response}

A relevant response:
- Answers the specific question asked
- Is helpful and actionable
- Does not include unrelated information
"""

def evaluate_relevance(inputs: dict, outputs: dict) -> bool:
    grade = evaluator_llm.invoke([
        {"role": "system", "content": "You assess answer relevance."},
        {"role": "user", "content": RELEVANCE_PROMPT.format(
            question=inputs.get("question", ""),
            response=outputs.get("answer", "")
        )}
    ])
    return grade["is_relevant"]
```

### 4. Retrieval Relevance Evaluator

Checks if retrieved documents are relevant to the query.

```python
class RetrievalRelevanceGrade(TypedDict):
    explanation: str
    is_relevant: bool

RETRIEVAL_PROMPT = """
Are the retrieved documents relevant to answering this question?

Question: {question}
Retrieved Documents: {context}

Relevant retrieval means the documents contain information needed to answer the question.
"""

def evaluate_retrieval_relevance(inputs: dict, outputs: dict) -> bool:
    grade = evaluator_llm.invoke([
        {"role": "system", "content": "You assess retrieval quality."},
        {"role": "user", "content": RETRIEVAL_PROMPT.format(
            question=inputs.get("question", ""),
            context=outputs.get("context", "")
        )}
    ])
    return grade["is_relevant"]
```

---

## Running Evaluations

### Create Test Dataset

```python
from langsmith import Client

client = Client()

dataset = client.create_dataset(
    dataset_name="task-api-rag-eval",
    description="Evaluation dataset for Task API RAG system"
)

examples = [
    {
        "inputs": {"question": "How do I create a new task?"},
        "outputs": {"answer": "Use POST /tasks with title and description."}
    },
    {
        "inputs": {"question": "How do I mark a task complete?"},
        "outputs": {"answer": "Use PATCH /tasks/{id} with status='completed'."}
    },
    {
        "inputs": {"question": "What happens when I delete a task?"},
        "outputs": {"answer": "DELETE /tasks/{id} removes the task permanently."}
    },
]

for example in examples:
    client.create_example(
        inputs=example["inputs"],
        outputs=example["outputs"],
        dataset_id=dataset.id
    )
```

### Run Evaluation

```python
experiment_results = client.evaluate(
    rag_pipeline,
    data="task-api-rag-eval",
    evaluators=[
        evaluate_correctness,
        evaluate_groundedness,
        evaluate_relevance,
        evaluate_retrieval_relevance,
    ],
    experiment_prefix="rag-v1",
    metadata={"model": "gpt-4o-mini", "retriever": "qdrant-hybrid"}
)
```

---

## RAGAS Integration

RAGAS provides battle-tested RAG metrics.

### Installation

```bash
pip install ragas
```

### RAGAS Metrics

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# Prepare data in RAGAS format
data = {
    "question": ["How do I create a task?"],
    "answer": ["Use POST /tasks endpoint"],
    "contexts": [["POST /tasks creates new task..."]],
    "ground_truth": ["Send POST request to /tasks with title"]
}

dataset = Dataset.from_dict(data)

# Evaluate
results = evaluate(
    dataset,
    metrics=[
        faithfulness,      # Is answer grounded in context?
        answer_relevancy,  # Does answer address question?
        context_precision, # Are retrieved docs relevant?
        context_recall,    # Do retrieved docs cover answer?
    ]
)

print(results)
# {'faithfulness': 0.95, 'answer_relevancy': 0.88, ...}
```

### RAGAS with LangSmith

```python
from ragas.integrations.langsmith import evaluate as ragas_evaluate

results = ragas_evaluate(
    dataset_name="task-api-rag-eval",
    llm=evaluator_llm,
    embeddings=embeddings,
    metrics=[faithfulness, answer_relevancy],
    experiment_name="ragas-eval-v1"
)
```

---

## Evaluation Metrics Reference

| Metric | Measures | Needs Reference? | Range |
|--------|----------|------------------|-------|
| **Faithfulness** | Answer grounded in context | No | 0-1 |
| **Answer Relevancy** | Answer addresses question | No | 0-1 |
| **Context Precision** | Retrieved docs are relevant | No | 0-1 |
| **Context Recall** | Retrieved docs cover answer | Yes | 0-1 |
| **Correctness** | Answer matches reference | Yes | 0-1 |
| **Semantic Similarity** | Meaning similarity to reference | Yes | 0-1 |

---

## Evaluation Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    RAG Evaluation Pipeline                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. PREPARE                                                   │
│     ├── Create test dataset (questions + expected answers)   │
│     └── Configure evaluators                                  │
│                                                               │
│  2. RUN                                                       │
│     ├── Execute RAG pipeline on test questions                │
│     ├── Trace with LangSmith                                  │
│     └── Collect outputs (answer, context, sources)            │
│                                                               │
│  3. EVALUATE                                                  │
│     ├── LLM-as-Judge (groundedness, relevance, correctness)  │
│     ├── RAGAS metrics (faithfulness, precision, recall)       │
│     └── Semantic similarity (embedding-based)                 │
│                                                               │
│  4. ANALYZE                                                   │
│     ├── Identify failure patterns                             │
│     ├── Compare to baselines                                  │
│     └── Track over time                                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### Dataset Design

- **Minimum 20-30 examples** for reliable metrics
- **Diverse question types**: factual, procedural, conceptual
- **Include edge cases**: ambiguous queries, multi-hop reasoning
- **Ground truth required** for correctness and recall metrics

### Evaluation Frequency

- **Development**: Evaluate on every significant change
- **CI/CD**: Automated evaluation on PR merge
- **Production**: Sample evaluation on live traffic

### Metric Thresholds

| Metric | Minimum | Good | Excellent |
|--------|---------|------|-----------|
| Faithfulness | 0.70 | 0.85 | 0.95+ |
| Answer Relevancy | 0.70 | 0.80 | 0.90+ |
| Context Precision | 0.60 | 0.75 | 0.85+ |
| Correctness | 0.70 | 0.85 | 0.95+ |

---

## Debugging Poor Metrics

| Low Metric | Likely Cause | Fix |
|------------|--------------|-----|
| Context Precision | Poor retrieval | Improve embeddings, add metadata filters |
| Context Recall | Incomplete chunking | Reduce chunk size, add overlap |
| Faithfulness | Hallucination | Stricter prompt, lower temperature |
| Answer Relevancy | Off-topic response | Better prompt engineering |
| Correctness | Wrong information | Improve retrieval + grounding |

---

## CI Integration

```yaml
# .github/workflows/rag-eval.yml
name: RAG Evaluation

on:
  push:
    branches: [main]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run evaluation
        env:
          LANGCHAIN_API_KEY: ${{ secrets.LANGCHAIN_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: python scripts/evaluate_rag.py
      - name: Check thresholds
        run: python scripts/check_thresholds.py --min-faithfulness 0.85
```

---

## Related References

- [langchain-patterns.md](langchain-patterns.md) - LangChain setup
- [rag-architectures.md](rag-architectures.md) - Different architectures to evaluate
- LangSmith Docs: https://docs.langchain.com/langsmith/
- RAGAS Docs: https://docs.ragas.io/
