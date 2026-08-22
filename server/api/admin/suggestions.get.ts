export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const issues = await listSuggestions();

  return issues
    .filter((issue) => !issue.pull_request) // /issues also returns PRs
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      createdAt: issue.created_at,
      parsed: parseSuggestion(issue.body ?? ""),
    }));
});
