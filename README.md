Overview

EcoTrack is a web application designed to help individuals understand, monitor, and reduce their carbon footprint through simple daily actions and personalized insights. The platform allows users to track activities that contribute to carbon emissions, visualize their environmental impact, and receive recommendations to adopt a more sustainable lifestyle.

The project aims to raise awareness about climate change by making carbon footprint tracking accessible, interactive, and easy to understand.
What Was Built
High-Fidelity UI Layout: Designed a clean, high-contrast dashboard with responsive grid cards, dedicated visual meters, and elegant typography pairing Space Grotesk headings with Inter body copy.
Impact Ledger: Implemented an action-logging ledger supporting quick logged shortcuts (e.g., solo driving, public transit, beef/vegan meals, clothing items) or manual values with custom dates.
Data Visualizations: Integrated real-time Recharts Pie and Bar Charts to display category emission shares and emissions generated over the last 7 days compared against budget lines.
Habit Pledges & Achievements: Created an Action Hub where users pledge to eco-habits (like vegan days or cold water washes). Completing habits increments streaks and logs offsets directly into charts.
Reforestation Offsets: Designed a virtual tree-planting sponsor card allowing users to plant seedlings to deduct CO₂ emissions virtually.
Secure Full-Stack AI Advisor: Established a secure Express server and Vite middleware backend that serves:
POST /api/advisor/analyze: Dynamically translates the user's profile and active logs into a structured JSON query for Gemini (gemini-3.5-flash), returning personal strengths and actionable recommendations.
POST /api/advisor/chat: Facilitates dialog with an AI Environmental Specialist, "Carbon Buddy," answering climate-science or environmental questions without exposing API keys.
