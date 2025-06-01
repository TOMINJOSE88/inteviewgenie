const form = document.getElementById('topic-form');
const input = document.getElementById('topic-input');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  result.innerHTML = "<p>Generating Q&A...</p>";

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ topic: input.value }),
    });

    const data = await response.json();
    const rawText = data.content;

    // Split using "Question:" or numbered patterns
    const qnaBlocks = rawText.split(/(?:\d+\.\s*)?Question:/i).filter(Boolean);

    let formattedHTML = "";
    qnaBlocks.forEach((block, index) => {
      const [question, answer] = block.split(/Answer:\s*/i);
      formattedHTML += `
        <div class="qa-block">
          <p><strong>Q${index + 1}:</strong> ${question?.trim()}</p>
          <p><strong>Answer:</strong> ${answer?.trim() || "N/A"}</p>
        </div>
        <hr>
      `;
    });

    result.innerHTML = formattedHTML;

  } catch (err) {
    result.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
});
