# CProtocol – MERN Stack Secure Communication Application

## Overview

CProtocol is a proposed secure messaging platform designed for environments where privacy and controlled communication are critical. The project is currently in its initial setup phase and is being developed as a concept prototype using the MERN stack.

---

## Problem Statement

Most existing messaging applications assume stable internet connectivity and trust centralized servers with user data. This creates several issues:

* Sensitive information can be exposed through server breaches
* Messages often remain stored without proper control
* Offline communication is unreliable
* Different users with different clearance levels cannot share a single structured channel securely

There is a need for a system that enables secure communication without trusting the server and that works even in unstable network conditions.

---

## Project Idea

CProtocol aims to address these problems by providing a platform where:

* All messages are encrypted on the client side before being sent
* The server only stores encrypted data
* Users are organized by roles with controlled access to information
* Messages can expire automatically after a set time
* Communication continues to work even when the user is offline

The goal is to build a secure, role-based, and offline-friendly messaging system suitable for organizations that require structured and private communication.

---

## Feature Comparison

| Feature                            |             CProtocol            | WhatsApp |      Telegram     |       Signal      |
| ---------------------------------- | :------------------------------: | :------: | :---------------: | :---------------: |
| End-to-End Encryption              | ✔️ (client-side only ciphertext) |    ✔️    | ✔️ (secret chats) |         ✔️        |
| Server never sees plaintext        |                ✔️                |     ❌    |         ❌         |         ❌         |
| Role-Based Access Control          |                ✔️                |     ❌    |         ❌         |         ❌         |
| Offline-First Store & Forward      |                ✔️                |     ❌    |         ❌         |         ❌         |
| Configurable Message Expiry        |                ✔️                |     ❌    |  ✔️ (auto-delete) | ✔️ (disappearing) |
| Per-Recipient Wrapped Keys         |                ✔️                |     ❌    |         ❌         |         ❌         |
| Auditable Logs (privacy preserved) |                ✔️                |     ❌    |         ❌         |         ❌         |
| Designed for unstable networks     |                ✔️                |     ❌    |         ⚠️        |         ❌         |

**Key:**

* ✔️ = Present
* ❌ = Not present
* ⚠️ = Partially or platform-specific

This table highlights where CProtocol aims to differentiate itself from common messaging platforms.

---

## Current Status

This project is currently under development and represents an initial architectural setup. Core functionality and features are planned but not yet fully implemented.

---

## Database Model Architecture
[View the diagram](https://dbdiagram.io/d/CProtocol-69a80728a3f0aa31e1c629ca)

## Vision

CProtocol is intended to become a practical demonstration of how secure, role-aware communication can be built using modern web technologies while maintaining privacy and reliability.
