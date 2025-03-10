# BearHug Voice Agent

An AI-powered voice agent for improving community service data collection and management.

## Overview

BearHug Voice Agent is part of the larger BearHug collaborative data quality platform that aims to consolidate and improve community service information across the social safety net. This voice agent specifically uses DailyBots to establish voice communication with community based organizations (CBOs) such as food banks, shelters, and other social service providers.

The agent conducts conversations to gather critical service information including:
- Organizational capacity
- Service availability and hours
- Program offerings
- Key contact personnel

By automating initial outreach and information gathering, the system saves valuable time for human data managers who can then focus on verification and quality assurance.

## Problem Solved

Currently, social service data exists in fragmented silos across various 211 systems, non-profits, churches, and community organizations. This fragmentation creates significant challenges for:
- Hospitals and healthcare providers
- Social workers
- Government agencies
- Philanthropic organizations
- Individuals seeking assistance

BearHug Voice Agent helps address this problem by streamlining the data collection process, automating initial outreach, and ensuring more comprehensive and up-to-date service information.

## Technical Details

### Architecture
- Built with React and Next.js
- Integrates with DailyBots via API for voice communication
- Uses RTVI SDK for React-based control of model interactions
- Can be packaged with Twilio or Daily for automated dialing

### Data Flow
1. Agent initiates calls to CBOs
2. Conducts structured conversations to gather service details
3. Data is stored in Human Service Data Specification (HSDS) format
4. Information undergoes human review
5. Verified data is federated and shared across the platform