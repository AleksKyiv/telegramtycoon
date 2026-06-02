# Assistant MVP

## Scope
This assistant exists only inside `OPERATOR`.

It does not exist in `PLAYER`.

## Purpose
The assistant is an operator-side AI companion that helps with:
- system understanding
- navigation
- summaries
- alerts interpretation
- fast operational context

It should reduce cognitive load for the operator.

## It Is
- an `AI guide`
- an `operations copilot`
- a `system explainer`

## It Is Not
- not a player feature
- not a source of truth
- not a core menu element
- not a fully autonomous controller

## Placement In UI
The assistant should appear as a separate visual presence block inside the operator interface.

Accepted direction:
- side panel
- assistant card
- expandable dock

Rejected direction:
- merged into menu
- merged into navigation
- mandatory full-screen chat layer

## MVP Features

### 1. Assistant Panel
A dedicated assistant area in `OPERATOR` with:
- assistant avatar / presence block
- text input
- response area
- optional quick actions
- optional voice trigger

### 2. Text Responses
The assistant answers operator questions in text.

Example tasks:
- explain what is happening in the system
- summarize current alerts
- summarize payment status
- summarize economy health
- highlight anomalies
- highlight what needs attention

### 3. System Summaries
The assistant can generate concise summaries such as:
- today summary
- current system status
- active risks
- alert digest
- experiment overview

### 4. Safe Navigation Actions
The assistant may trigger safe UI actions:
- open a section
- filter players
- show payments
- show alerts
- show suspicious users
- open backups/health status

These actions must not mutate critical state.

### 5. Voice Output
The assistant may speak responses aloud.

This is deferred until after the text-first MVP.

## Not In MVP
- player-facing assistant
- autonomous system decisions
- critical actions without confirmation
- long-term universal memory
- advanced predictive AI control
- deep voice conversation loop from day one
- voice output in phase 1
- voice input in phase 1

## Phase 1 Delivery Rule
Assistant delivery starts as `text-only`.

This means phase 1 includes:
- assistant panel
- text input
- text responses
- summaries
- safe navigation actions

Voice is a later layer, not part of the first delivery target.

## Architecture

### 1. Assistant UI
Visible operator-facing interface block.

### 2. Assistant Orchestrator
Receives question/input and decides how to respond.

### 3. Context Broker
Collects normalized operator-safe context from:
- metrics
- alerts
- economy summaries
- player summaries
- billing summaries
- backup/health summaries

### 4. Safe Action Adapters
Expose allowed non-destructive actions.

### 5. Voice Output Layer
Converts response text to speech.

### 6. Assistant Audit Log
Records assistant-triggered navigation/actions.

## Data Access Principle
The assistant should not read arbitrary raw storage directly in MVP.

It should consume:
- summaries
- read models
- normalized context payloads

This reduces complexity and risk.

## Suggested Voice Character
- female-presenting
- calm
- warm
- precise
- premium AI guide
- not theatrical
- not robotic

## Success Criteria
The assistant MVP is successful if:
- it saves operator time
- it makes the control center easier to use
- it explains system state clearly
- it stays separate from core operator navigation

## Working Rule
Use `[ASSISTANT]` tag for all future work related to this module.
