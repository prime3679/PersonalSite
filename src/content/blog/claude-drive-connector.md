---
title: "What Claude's Google Drive connector actually does"
shortTitle: "Claude's Google Drive connector"
date: 2026-10-29
tags: ["ai"]
description: "A tested teardown of Claude's Google Drive connector: what it reads, what it can write and share, where Anthropic's own pages disagree, and what to verify before you approve it."
published: true
---

Tested September 24, 2026. Re-checked against the live tool definitions and Anthropic's documentation on October 14 and October 29, 2026. Every claim below is marked one of three ways: **tested** (a call I made and a response I saw), **stated** (what the tool definition or Anthropic's docs say, not exercised), or **untested**.

## scope, so you can reproduce it

- Account: a personal Google account, not a Workspace account. No shared drives, no admin console.
- Claude plan: personal Max (the 5x tier). Not Team or Enterprise, so none of the org-level controls were in play.
- Surface: the calls were made by Claude running as an agent (Cowork), where the model calls tools directly. This is not the claude.ai chat window. Anthropic's docs say "Claude can ask for your approval before it uses one of the connector's tools." I never saw that prompt. Treat the absence as a property of this surface and my settings, not of the connector.
- Vendor: Anthropic's docs page states "Google builds and runs the connector." The OAuth token and the file content pass through Google's connector, not only Anthropic's servers. I never saw the consent screen, so the exact scope requested is untested.
- Tool definitions change without notice. One tool's description still says a feature is "Coming soon." Appendix A is the snapshot I tested against; check yours against it.

## TL;DR, forward this to your security team

- The connector exposes eleven tools. Six read, five write. **Tested** (full list in Appendix A).
- It reads everything your Google account can open, including files other people shared with you. **Tested.** Whether it can reach "anyone with the link" files you've never opened is **untested**; the one such file I saw had also been shared with me directly.
- List and search calls return file contents, not just names. The default returns about 5,000 characters per file; the smallest setting still returns about 1,000; a `MAX_ALLOWED` setting lifts the cap to the response size. **Tested** for the first two, **stated** for the third.
- It can grant `writer` access on any file you can share, to any address your Workspace sharing policy allows. **Stated.** I did not run it.
- It returns comment threads, with commenter names and resolved threads included, when `includeComments: true` is passed. **Tested.** Anthropic's docs page says comments are not readable. Its help center changed this week to say they are.
- It cannot edit a document's body, cannot delete permanently, and has no tool to remove a share. **Stated** (no such tools exist in the definition).

## why this matters

Drive is where the sensitive material lives in most companies. Board decks, comp plans, customer contracts, the M&A folder somebody forgot to lock down.

Approving this connector means approving access to all of that, at the level of each user who turns it on. The connector adds no permission model of its own. It inherits the user's. That is the right design. It also means the connector is exactly as safe as your sharing hygiene.

## what the connector can see

**Tested.** I started with `list_recent_files` at its defaults. Five results. Each had a title, owner email, file ID, parent folder ID, timestamps, and a `contentSnippet`: the opening text of the file. On a spreadsheet, the first rows as CSV. On a doc, the first paragraphs.

`snippetVerbosity` controls the size. `DETAILED` is the default, about 5,000 characters. `BRIEF` gave me about 1,000, which is what the definition says it should. `MEDIUM` is about 2,500 and `MAX_ALLOWED` is "greatly increased, limited by the overall response size"; I didn't run those two. Only `excludeContentSnippets: true` returned metadata alone. The point for a reviewer: a call that sounds like a directory listing is a content read, and the model has to opt out of the content, not into it.

`search_files` takes Drive query syntax: `title`, `fullText`, `mimeType`, `owner`, `parentId`, `sharedWithMe`, and the time fields. `fullText contains 'password'` returned five slide decks with their slide text in the snippets. Full-text search across a whole Drive, with bodies attached, is one call, and `next_page_token` lets it walk the whole account.

`sharedWithMe = true` returned ten files from seven other accounts on the first page. Owner email addresses came back in plain text. `parentId` walks folders; pointed at a folder a third party had shared with me, it listed subfolders I had never opened.

`read_file_content` returned full text for a Google Doc, a multi-tab Doc (every tab), a markdown file, and a 583 KB PDF, which came back as 123,284 characters in one response with no paging. A PNG came back as OCR text plus Google's image labels. `download_file_content` with `exportMimeType` set to the Word type exported a Google Doc as base64 .docx. Any file you can read, the connector can pull out whole.

`get_file_permissions` lists who has access. On a file someone shared with me it showed the owner's email and `{"role":"writer","type":"anyone"}`. The connector reveals sharing posture on files you don't own. That helps an auditor. It is also a map for anyone hunting for loosely shared files.

## what it can write

**Stated.** I did not run any write tool against an existing file. The definitions allow:

- `create_file`: upload any content, with optional conversion to a Google format. Also creates folders.
- `copy_file`: copy any file you can read into any folder you choose.
- `update_file`: rename a file, or move it by changing its parent. "Currently only title and parent_id are supported."
- `share_file`: grant `writer`, `commenter`, or `reader` to "a user or group" by email. If they already have access, it raises them to the higher role. It never lowers one.
- `trash_file`: move a file to trash. No permanent delete.

The only writes I made were the deliverable: one folder and one Google Doc via `create_file`. **Tested.**

`share_file` is the one to look at. Paired with `copy_file`, it gives the model a two-step path: copy any readable file, then share the copy outward. Two things limit that, and I verified neither. Your Workspace external-sharing policy governs which addresses `share_file` can reach; the connector doesn't override Google. And Anthropic's help center says "By default, Claude asks for your approval before each of these actions," and that "owners decide whether members can allow these actions to run without asking each time." I could not observe that approval prompt from the surface I tested on. **Untested.**

## what it refuses

**Tested.**

- `trashed = true` in a search returned `Unsupported query field: trashed`. It can't see your trash.
- `download_file_content` with a `revisionId` returned "not yet supported. Coming soon!" Version history is out of reach for now. Re-review when it ships.
- A made-up file ID returned `Entity not found.` I had no real file I was locked out of, so I can't confirm a restricted file gives the same error.

**Stated.** No tool edits a document's body. No tool removes a permission. A mistaken share has to be undone by a person in Drive.

## where the docs and the behavior disagree

On September 24 I read Anthropic's two pages about this connector as contradicting each other on Sheets and Slides. On October 14 the page at claude.com/docs/connectors/google/drive lists Google Sheets and Google Slides as readable, so either I misread it or it changed. I'm dropping that claim.

As of October 29, Anthropic's two pages disagree on comments. The docs page at claude.com/docs/connectors/google/drive says: "Comments and suggestions: Claude can't read a file's comments or suggested edits, only its content." The help center article, updated the week of October 26, now says: "Claude can see comments and suggestions in Google Docs, but it can't see images." In September the help center said the opposite.

What I saw, **tested**: `read_file_content` with `includeComments: true` returned a comment thread with the commenter's full name, the text, a timestamp, a reply from a second named person, and `"status":"RESOLVED"`.

The help center now matches what I saw. The docs page doesn't. A reviewer reading the docs page would conclude comments never reach the model. The fair reading is that comments are opt-in by parameter, not silently included. They do reach the model, resolved ones too, and they're where people write what they wouldn't put in the doc.

## shared files are an injection surface

**Tested.** One file shared with me from outside my account had extra tabs titled "Claude Instructions" and "SYSTEM PROMPT." `read_file_content` returned them inline with the rest of the document, as ordinary content. The file's owner wrote those tabs, not me. Its sharing was `anyone` with `commenter`.

The connector does nothing to mark third-party text as untrusted. It arrives looking the same as your own notes. How Claude then treats it is a property of the model and the client, not the connector, and I didn't test it by acting on the instructions. The case a reviewer should picture: a model reading a planted instruction with `share_file` available and approvals switched off.

## what an admin can change

**Untested**, because this was a personal account:

- Whether a Workspace admin can limit the connector to certain shared drives or organizational units.
- Whether a Claude org owner can disable single tools such as `share_file` while leaving reads on. Anthropic's connector docs describe a "tool access" setting for Team and Enterprise; I have not seen what granularity it offers.
- The exact OAuth scope. I never saw the consent screen, so I don't know if it's full `drive` or narrower.
- Whether shared drives behave like My Drive.

**Stated.** The help center says Workspace admins can mark Claude as a "Trusted" app under API controls, and that on Team and Enterprise the connector doesn't appear until an Owner adds it. Those are the two documented levers.

## where the data goes

Not retested here. [My June piece on the Gmail connector](/writing/claude-gmail-connector-data/) covers the data-handling terms that apply to the Google Workspace connectors as a family: Anthropic says it does not train on connector data on any plan; retrieved content is stored with the chat and lives as long as the chat does; on Enterprise that means indefinitely until an Owner sets a retention period. Re-checked against the help center on October 29, 2026: "We do not train our models on your Gmail, Drive, or Calendar connector data," and retrieved data "is retained with its associated chat." One addition from this teardown: nothing I found says whether comment threads fetched via `includeComments` are treated the same as file contents under those terms. Ask.

## what to ask before you approve it

1. What exact OAuth scope does the connector request? Full `drive`, or `drive.readonly` plus `drive.file`?
2. Can we turn off `share_file` and `copy_file` for our org and keep reads? What does "tool access" actually let an Owner do?
3. Is the write approval enforced server-side, or only in the chat client? Does it hold in Cowork, Claude Code, and the API?
4. Are comment threads covered by the same retention and training terms as file contents?
5. When revision download ships, will it be opt-in?
6. Is there a per-user log of which files the connector read, on either Anthropic's side or in the Google Workspace audit log, and can we export it?
7. Does Google's role as the connector's operator put file content on Google infrastructure outside our existing Workspace agreement?
8. How does Claude treat instructions that arrive inside a shared file?

## the bottom line

The read side is broad and faithful. It sees what the user sees, comments included, and it hands over owner and sharing data freely. If your sharing is clean, that's fine. If it isn't, Claude will find the mess faster than you will.

The write side is narrow in the right places and wrong in one. It can't edit bodies or delete permanently. It can share with any address your policy allows, and it can't unshare.

I'm not going to tell you to approve it. This was one personal account on one surface with the approval gate unobserved. What I can tell you is what to verify first: the OAuth scope, whether an Owner can switch off `share_file` while keeping reads, and whether the write approval is enforced somewhere a model can't skip. Get those three in writing and the read side is an easy yes.

---

## appendix A: the eleven tools, as defined on October 14, re-checked October 29, 2026

Read (6)

- `list_recent_files`: sort by `recency`, `lastModified`, `lastModifiedByMe`; default page size 10; `snippetVerbosity` default `DETAILED`; `excludeContentSnippets` for metadata only.
- `search_files`: Drive query syntax on `title`, `fullText`, `mimeType`, `modifiedTime`, `viewedByMeTime`, `createdTime`, `parentId`, `owner`, `sharedWithMe`; paginated; same snippet controls.
- `get_file_metadata`: one file's metadata; same snippet controls.
- `get_file_permissions`: who has access to a file, with role and type.
- `read_file_content`: natural-language rendering of a file; `includeComments` parameter.
- `download_file_content`: base64 of the file; `exportMimeType` for Google-native files; `revisionId` accepted but "not yet supported."

Write (5)

- `create_file`: text or base64 content, with Google-type conversion by default; creates folders.
- `copy_file`: copy to any folder; defaults to the original's folder or the user's root.
- `update_file`: title and parent only.
- `share_file`: `writer` / `commenter` / `reader` to an email address; raises, never lowers.
- `trash_file`: trash only; no permanent delete.

## appendix B: what changed in this version

- Dropped the claim that Anthropic's two pages disagree on Sheets and Slides; as of October 14 they agree. Kept, and sharpened, the comments finding.
- Updated the comments finding after the help center changed its wording the week of October 26.
- Added the scope statement (account, plan, surface, vendor) and the tested / stated / untested labels.
- Named all six read tools; the earlier version listed five and said six.
- Added the `MAX_ALLOWED` verbosity setting and the pagination point.
- Added Google as operator, the data-handling pointer, and audit logging to the questions.
- Replaced "approve it for read" with what to verify first. One personal account on one surface doesn't earn a verdict.
