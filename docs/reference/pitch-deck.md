# PlateWise — Pitch Deck Reference

> Source: [PlateWise — Google Slides](https://docs.google.com/presentation/d/1Zx8qGo2xySk2TT8hbbjchaWO35s-cgFsDaxhjJ3WBjU/edit)  
> Context: BUILD YYC · Team 8 (Jacky, Alan, Surya, Ryan, David)  
> Source: 10-slide pitch deck, modified October 25, 2026  
> Purpose: Product vision and business context for application development. **This is not an implementation status report.**

## 1. Product Vision (Slide 1)

**PlateWise:** “We are your weekly grocery restocker, that is planned around your goals, pantry and this week's deals.”

PlateWise aims to combine meal planning, pantry awareness, grocery deals, and personal goals into one tailored weekly restock.

## 2. The Problem (Slide 2)

**Problem statement:** Few people plan what they eat; this affects their health, wealth, and convenience.

- **Health:** Pantry inventory is rarely stocked around health goals.
- **Wealth:** Nine surveyed shoppers reported throwing out food monthly. Unplanned shopping leads to overspending and waste.
- **Convenience:** Twelve shoppers spend at least 15 minutes each week deciding what to eat.

> Shopper quote: “Meals that use same ingredients for a week so things go to waste less.”

**Existing approaches:** Meal apps that ignore fridge contents; paper flyers, Flipp, PC Optimum, paper lists, or simply walking into a store.

**Cost:** Wasted money, planning time, and pantries that don't support personal goals.

## 3. Early Adopters / ICP (Slide 3)

**Audience:** Busy professionals with limited time to plan meals.

Behavioral indicators:
- Order takeout or delivery to save time.
- Already use PC Optimum, Flipp, or store flyers.
- Make lists but still lose planning time or waste food.

**Trigger:** A busy week and a half-empty pantry, creating a choice between planning groceries or ordering takeout.

**Discovery observations (25 Calgary shoppers interviewed in person):**
- 12 spend 15+ minutes per week planning meals.
- 10 shop at two or more stores.
- 10 use PC Optimum.
- 16 want to try the application.
- 9 left an email to test it.

Potential channels: Superstore, shoppers, Instagram, LinkedIn, Calgary workplaces, and community groups.

*These are early customer-discovery observations, not representative market statistics.*

## 4. The Solution (Slide 4)

**Value proposition:** “For busy Calgary shoppers, PlateWise plans your weekly restock around your goals, pantry and budget.”

**Why:** Poor planning costs health, wealth, and convenience.  
**How:** Learn goals and preferences; buy only what is needed, at the best store.  
**What:** A tailored weekly restock plan.

### Target user journey

1. **Know your home:** Set goals, weekly budget, and pantry information; update them as shopping happens.
2. **Plan your week:** Suggest dinners from this week's deals, pantry contents, and user goals, with sample pricing for two.
3. **Restock near you:** Buy only missing items at a suitable nearby store, consider trip cost, and receive expiry-related heads-ups.

These steps describe the **target experience**, not confirmed implemented features.

## 5. Market Opportunity (Slide 5)

| Measure | Pitch estimate | Description |
| --- | ---: | --- |
| TAM | CAD $128.5B annually | Grocery spend of Canadian households |
| SAM | CAD $3.0B annually | Calgary households that use flyers |
| SOM | CAD $49.9M annually | Assumed 1% of Calgary households |

**Pitch inputs:**
- 502,301 Calgary households (Statistics Canada Census 2021).
- $9,936 average annual Alberta household grocery spend (Statistics Canada 2023).
- ~61% of Canadians use flyers to find deals (Dalhousie 2024).
- $1,300 annual household food waste (NZWC 2022).
- 16 of 25 Calgary shoppers expressed interest; 9 shared emails (team survey/interviews, October 24).

**Slide calculation notes:** TAM = 14,978,941 Canadian homes × $8,579; SAM = 502,301 Calgary households × 60.9% × $9,936; SOM = 1% of Calgary homes (assumption).

**Validation caveat:** These are estimates and assumptions recorded in the deck. Independently check them before external publication or financial forecasting. SOM is a fraction of estimated grocery spending, **not PlateWise revenue**.

## 6. Competition & Differentiation (Slide 6)

**Positioning:** Grocery-deal applications help find discounts; PlateWise aims to plan the *whole restock* around pantry, goals, and budget.

Named alternatives and competitors: shopping without an app, generic recipe apps, Flipp, PC Express + PC Optimum, RecipeWiz, Deal Dish, and CartBrain.

| Capability | Pitch notes |
| --- | --- |
| Deals across stores | Deal Dish and Flipp described as strong. 6 of 16 respondents mentioned too many stores to check. |
| Pantry + goals; buy only what's needed | Desired differentiator. Goals and fridge photo described as next to build. |
| Budget fit | CartBrain cited as strong; interviews 4, 6, and 7 raise price/budget concerns. |
| Best store + true trip cost | Interview 2: “I don't have to go to three grocery stores”. |
| Whole restock | **Deal-to-list works in the pitch demo**; pantry, budget, and store selection follow on the roadmap. |

The competition map distinguishes demo functionality from roadmap items and competitor capabilities. Placements are team judgments based on app listings, eight interviews, and the survey.

## 7. MVP Demo and Capability Inventory (Slide 7)

| Capability group | Listed features |
| --- | --- |
| Smart onboarding | Personalization, meal planning, dietary preferences, household profiling |
| Price intelligence | Price comparison, grocery savings, budget tracking, store optimization |
| Pantry awareness | Kitchen staples, use-it-up planning, fridge photo |
| Alerts and location | Use-it-soon heads-up, low-stock reminders, stores near you |
| Goals and sharing | Health goals, share your plan |

**Development interpretation:** Treat this as a proposed capability inventory. Slide 6 specifically calls out deal-to-list as working in the pitch demo, with pantry, budget, goals/fridge photo, and store optimization on the roadmap. Verify implementation from current source code and tests before marking any feature complete.

### Derived product requirements (interpretation)

- Collect household size, dietary preferences, shopping preferences, and personal goals.
- Recommend meals based on relevant deals and available pantry ingredients.
- Build grocery lists with needed quantities, subtracting usable pantry stock.
- Consider weekly budget and total shopping/travel cost.
- Give low-stock and use-it-soon reminders.
- Share actionable grocery plans and show potential savings.

These are possible requirements for refinement, **not confirmed MVP commitments**.

## 8. Business Model (Slide 8)

**Now:** Free experience, prioritize user acquisition.

**Proposed free tier:** Flyer deals, dinners, grocery list; eventually a small number of relevant grocery-deal ads.

**Proposed premium tier:** **CAD $3.99/month**; no ads and added pantry features such as heads-up reminders. Deck compares the price with Deal Dish Pro and CartBrain ($12); check those rates again before external use.

**Later:** Grocer partnerships, sponsored deals, and affiliate commissions.

**Assumptions to test with first 100 users:**
- CAC: $0–$2 using in-store QR codes and shared links.
- LTV calculation in pitch: $3.99 × number of months on Premium (gross subscription receipts; not net contribution profit).

**Product intent:** Ads remain light and relevant, with no ads while cooking.

## 9. Go-to-Market Plan (Slide 9)

| Stage | Proposed action |
| --- | --- |
| First 10 | Interview at Superstore, distribute survey QR, send prototype to interested people. |
| First 100 | Instagram Stories, LinkedIn, share-a-recipe links highlighting deals and savings, linking back to the application. |
| Scale | Calgary community groups and shareable recipes/lists; then a grocer partner pilot. |

**Primary engagement metric:** Week-2 return rate.

## 10. Roadmap & The Ask (Slide 10)

### Next 30 days

The original slide has the heading **“Next 30 days”** and the phrase **“Customer Discovery”**, but does not contain a clear detailed milestone list in extracted slide text. Confirm the intended commitments before creating development tasks.

### Next 90 days

- Add budget fit to pantry heads-up.
- Reach **100 weekly users**.
- Test **$3.99 Premium** with **20 users**.

### Six to twelve months

- Expand beyond Calgary flyers and grocery stores.
- Pilot sponsored deals with a grocer.

### The Ask

1. Introductions to Calgary grocers (Co-op, Superstore).
2. 20 beta testers from the audience.
3. A mentor interested in the idea and in improving shoppers' health, wealth, and convenience.

## Guidance for Application Development

1. Use this document to understand **product vision, customer pain, goals, and positioning**. It does not establish current implementation status.
2. Cross-check the repository and tests before describing a feature as complete.
3. Keep interview results, market figures, pricing, and economics clearly marked as historical evidence or hypotheses.
4. Prioritize a coherent core restock flow over implementing every slide-7 idea simultaneously.
5. When writing implementation specifications, link proposed work to the relevant slide and record later product decisions separately.
6. Avoid turning research figures, goals, competitor comparisons, or pricing assumptions into unchangeable application rules.

### Related References

- [Original Google Slides pitch](https://docs.google.com/presentation/d/1Zx8qGo2xySk2TT8hbbjchaWO35s-cgFsDaxhjJ3WBjU/edit)
- [Profile interview requirements](../profile-interview-requirements.md)

---

*Prepared as a developer-friendly reference from the Google Slides extracted text. Images, visual diagrams, and speaker notes are not fully reproduced.*
