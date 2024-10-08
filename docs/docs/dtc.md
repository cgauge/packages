---
title: DTC
layout: default
nav_order: 2
---

# Declarative Test Cases

## Introduction

Declarative Test Case was created to avoid writing code to test the code (in the end, who tests the test?). The main idea is to have a similar way of thinking while writing tests. Using the same data and structure format, something that can be shared between people with different knowledge level and abilities.

The executing and plugins flow follow the Arrange-Act-Assert pattern:

```mermaid
graph TD;
    accTitle: Arrange-Act-Assert
    accDescr: Test steps
    Arrange[Arrange inputs and targets]
    Act[Act on the target behavior]
    Assert[Assert expected outcomes]
    Arrange-->Act;
    Act-->Assert;
```

# Architecture

The library architecture is divided in four main parts: Loader, Runner, Test Types and Plugins

```mermaid
flowchart LR
    accTitle: Architecture
    accDescr: Executing flow
    Loader-->Files@{ shape: processes, label: "Files" }
    subgraph Runner
        subgraph Test Type Plugins
            Arrange-->Act
            Act-->Assert
        end
    end
    Files-->Runner
```

## Loader

By default DTC loads Javascript files expecting the content to be default exported, but you can basically load any file type by configuring a custom loader.

## Runner

By default DTC use Node Native Test Runner Javascript, but it is also flexible to be configured to use Jest, Playwright or any other Test Runner.

## Default test types

- Unit: it runs small set of code
- Narrow: for integration tests mocking network, like HTTP calls
- Broad: for integration tests using network

