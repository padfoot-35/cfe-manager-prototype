// Static content for the prototype. Names of partners, customers and factories are fictional.
export const YEARS = [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036];

export const FIN = {
  net: [1.0, 4.2, 14.9, 34.7, 66.5, 116.7, 188.7, 286.1, 409.5, 562.7],
  gross: [5.8, 24.9, 109.3, 281.5, 564.1, 1019.6, 1684.8, 2601.1, 3771.8, 5236.9],
  ebitda: [-10.5, -10.4, -5.4, 6.5, 26.6, 59.5, 107.9, 172.7, 253.9, 352.3],
  coreEbitda: [-10.5, -10.4, -6.7, 1.8, 15.5, 36.3, 64.7, 99.7, 140.3, 185.5],
  p10: [-11.4, -11.6, -8.0, -0.2, 12.8, 34.5, 65.1, 104.5, 152.0, 214.8],
  p50: [-10.5, -10.5, -5.3, 7.2, 28.8, 64.1, 118.7, 180.9, 275.2, 374.3],
  p90: [-9.8, -9.3, -1.0, 18.3, 52.9, 105.1, 187.6, 300.7, 437.3, 612.4],
  streams: {
    "Platform fee": [0, 0, 1.4, 5.2, 12.4, 25.9, 48.0, 81.5, 128.0, 190.7],
    "Energy margin": [0, 0, 3.0, 9.4, 20.4, 39.4, 67.4, 105.0, 150.6, 204.1],
    "Ledger + factory": [0.2, 0.6, 1.6, 3.1, 5.5, 9.1, 13.9, 20.3, 28.1, 37.7],
    "Certificates": [0.5, 1.9, 4.7, 9.2, 15.6, 24.6, 35.8, 49.8, 67.1, 88.2],
    "Night Wrap": [0.4, 1.7, 4.2, 7.9, 12.5, 17.9, 23.6, 29.6, 35.7, 42.1],
  },
  costs: [11.6, 14.6, 20.2, 28.3, 39.9, 57.2, 80.8, 113.4, 155.7, 210.4],
  headcount: [15, 18, 22, 28, 37, 50, 67, 90, 119, 155],
  fcf: [-13.9, -14.7, -13.8, -8.3, 3.4, 9.9, 29.9, 60.3, 102.1, 154.5],
  cumFcf: [-13.9, -28.7, -42.5, -50.8, -47.4, -37.6, -7.6, 52.7, 154.8, 309.3],
  equity: [40, 0, 40, 0, 0, 0, 0, 0, 0, 0],
  cash: [26.1, 11.3, 37.5, 29.2, 32.6, 42.4, 60.0, 60.0, 85.7, 121.6],
  lcMargin: [0.1, 0.4, 1.6, 4.1, 8.3, 15.1, 24.9, 38.6, 56.0, 77.9],
  tradedMU: [0, 0, 82, 288, 661, 1313, 2315, 3745, 5603, 7954],
  netWorthNeed: [2, 2, 2, 2, 10, 10, 20, 20, 35, 50],
  headroom: [26.9, 15.2, 48.2, 52.5, 68.3, 111.1, 167.3, 234.0, 329.9, 457.2],
  cfeMW: [0, 0, 7.1, 24.8, 56.8, 112.7, 198.8, 321.6, 481.1, 683],
  wrapMW: [9, 32, 72, 123, 185, 255, 328, 402, 479, 559],
  factories: [0, 0, 1, 2, 4, 8, 14, 23, 35, 50],
  kpi: { equity: 80, peak: 51, breakEven: 2030, cashPositive: 2034, irr: 64, irr8: 58, irr10: 61, irr15: 68, irrNoExit: 18, dcf: 395, exitPV: 958, ltvcac: 23, dividends: 268, core: 186, poolContrib: 167 },
  scen: { Bear: { net: 206, ebitda: 59, peak: 207 }, Base: { net: 563, ebitda: 352, peak: 51 }, Bull: { net: 1230, ebitda: 937, peak: 37 }, "Base, no pooling": { net: 375, ebitda: 186, peak: 64 } },
  mc: { netP: [393, 587, 879], ebitdaP: [215, 374, 612], peakP: [39, 50, 70], irrP: [53, 66, 79], pNeed95: 2, pFacility: 19, coreEbitdaP: [44, 215, 413] },
  useOfFunds: [["Team", 15.4], ["Engine and tech", 14.3], ["Reserve into Series A", 11.3], ["Pilots and go-to-market", 2.5], ["Working capital incl. LC margin", 1.7]],
  tornado: [
    ["Battery tolls +10% (−30% upside)", -88, 263],
    ["Pooling not allowed (all states)", -166, 0],
    ["Price −₹0.25/kWh", -133, 0],
    ["Bad-weather year, 3 points missed", -122, 0],
    ["Supply a year late", -90, 0],
    ["All partner prices +3%", -88, 0],
  ],
};

export const PARTNERS = [
  { id: "SOL-GJ-01", name: "Sunfield Solar SPV", kind: "Solar", state: "Gujarat", mw: 380, unit: "MWac", contract: "15-yr PPA · ₹2.54/kWh of load", status: "Live", gates: 6 },
  { id: "WND-GJ-02", name: "Westwind IPP", kind: "Wind", state: "Gujarat", mw: 110, unit: "MW", contract: "15-yr PPA · ₹1.08/kWh of load", status: "Live", gates: 6 },
  { id: "BES-GJ-01", name: "Gridstore Battery Co.", kind: "Battery", state: "Gujarat", mw: 100, unit: "MW / 400 MWh", contract: "Toll · ₹1.54/kWh of load, indexed in a band", status: "Live", gates: 6 },
  { id: "GDAM-TM", name: "Green exchange blocks", kind: "Top-up", state: "Exchange", mw: 20, unit: "MW cap", contract: "Via trading member · ₹5.0/kWh avg", status: "Live", gates: 6 },
  { id: "SOL-MH-03", name: "Deccan Solar Park", kind: "Solar", state: "Maharashtra", mw: 200, unit: "MWac", contract: "PPA in negotiation", status: "Commercial terms", gates: 4 },
  { id: "HYB-TG-01", name: "Telangana Hybrid One", kind: "Hybrid", state: "Telangana", mw: 150, unit: "MW", contract: "Backtest running", status: "Qualification", gates: 3 },
  { id: "BES-MH-02", name: "Konkan Storage", kind: "Battery", state: "Maharashtra", mw: 80, unit: "MW / 320 MWh", contract: "Toll term sheet", status: "Commercial terms", gates: 5 },
  { id: "WND-TN-04", name: "Coromandel Wind", kind: "Wind", state: "Tamil Nadu", mw: 120, unit: "MW", contract: "Registered", status: "Registered", gates: 1 },
];

export const FACTORIES = [
  { name: "Surat Textile Mills", city: "Surat", state: "Gujarat", mw: 8.5, equity: 12.6, use: 12.5 },
  { name: "Vapi Chemicals Unit 2", city: "Vapi", state: "Gujarat", mw: 9.0, equity: 13.4, use: 13.2 },
  { name: "Rajkot Castings", city: "Rajkot", state: "Gujarat", mw: 7.5, equity: 11.0, use: 11.0 },
  { name: "Ankleshwar Pharma", city: "Ankleshwar", state: "Gujarat", mw: 8.0, equity: 11.8, use: 11.7 },
  { name: "Morbi Ceramics", city: "Morbi", state: "Gujarat", mw: 10.0, equity: 14.6, use: 14.7 },
  { name: "Halol Auto Components", city: "Halol", state: "Gujarat", mw: 8.5, equity: 12.4, use: 12.5 },
  { name: "Sanand Packaging", city: "Sanand", state: "Gujarat", mw: 8.0, equity: 11.7, use: 11.8 },
  { name: "Bharuch Polymers", city: "Bharuch", state: "Gujarat", mw: 8.5, equity: 12.5, use: 12.6 },
];

export const CUSTOMERS = [
  { name: "Colocation A", site: "Navi Mumbai campus", state: "Maharashtra", mw: 100, product: "CFE Service", wave: 1, status: "Live", score: "90.8%" },
  { name: "Hyperscaler B", site: "Mumbai region (tenant)", state: "Maharashtra", mw: 60, product: "Hourly Certificates", wave: 1, status: "Live", score: "certificates" },
  { name: "Colocation C", site: "Chennai campus", state: "Tamil Nadu", mw: 40, product: "Night Wrap", wave: 1, status: "Live", score: "71%" },
  { name: "GCC D (multinational)", site: "Hyderabad office park", state: "Telangana", mw: 12, product: "Certificates + Ledger", wave: 2, status: "Proposal", score: "–" },
  { name: "IT Services E", site: "Pune campus", state: "Maharashtra", mw: 18, product: "Ledger → Night Wrap", wave: 2, status: "Diagnostic", score: "–" },
  { name: "Cement Exporter F", site: "Kutch plant", state: "Gujarat", mw: 45, product: "CFE Service (CBAM)", wave: 3, status: "Shadow mode", score: "88%" },
  { name: "AI Campus G", site: "Navi Mumbai", state: "Maharashtra", mw: 150, product: "CFE Service (CFE95 ask)", wave: 1, status: "Feasibility", score: "–" },
];

export const STATES = [
  { name: "Gujarat", gates: [2, 2, 2, 2, 2, 2, 1, 2], position: "Pilot state. Partner solar, wind and battery qualified; group-captive pooling in force; first pool opens 2029.", entry: 2027, poolOpen: 2029, pool: 1.0 },
  { name: "Maharashtra", gates: [2, 1, 1, 1, 2, 1, 1, 2], position: "Mumbai hub, strongest demand. 2026 Rules cap each member at its ownership share, so equity is sized to use; pool opens 2030 after counsel clears allocation.", entry: 2028, poolOpen: 2030, pool: 0.75 },
  { name: "Telangana", gates: [2, 1, 1, 1, 1, 0, 0, 1], position: "Hyderabad hub. Hybrid partner in backtest; pooling allowed in the model from 2030.", entry: 2030, poolOpen: 2031, pool: 1.0 },
  { name: "Tamil Nadu", gates: [1, 1, 1, 0, 1, 0, 0, 1], position: "Chennai hub with strong wind. Partner registered; opens 2031.", entry: 2031, poolOpen: 2032, pool: 1.0 },
];
export const GATE_NAMES = ["Customer", "Regulation", "Partner assets", "Grid route", "Evidence", "Counterparties", "Pooling counsel", "Governance"];

export const CONTRACTS = [
  ["Master CFE Services Agreement", "CFE Manager ↔ Colocation A", "Signed", "Monthly CFE90 score, ₹6.70/kWh all-in (₹6.50 energy + ₹0.21 platform fee of ₹1.5 lakh/MW/month), ₹0.10/kWh rebate once the state pool is 80% full, 2% of bill per point below 90% (cap 10%), 15 years", "Commercial"],
  ["Solar PPA · SOL-GJ-01", "Sunfield Solar SPV ↔ CFE Manager", "Signed", "Fixed 15-yr price, shape, curtailment allocation, exclusive attribute transfer", "Partners"],
  ["Wind PPA · WND-GJ-02", "Westwind IPP ↔ CFE Manager", "Signed", "Availability, scheduling via QCA, attribute title", "Partners"],
  ["Battery toll · BES-GJ-01", "Gridstore Battery Co. ↔ CFE Manager", "Signed", "Dispatch rights, SoC 10–95%, charge-source logging, toll indexed within a band", "Partners"],
  ["Trading mandate", "CFE Manager ↔ trading member", "Signed", "G-DAM top-up bids and surplus sales within limits; confirmations as evidence", "Trading"],
  ["Open access and wheeling", "Members ↔ SLDC / DISCOMs", "Approved", "15-minute metering, scheduling, banking rules per state", "Regulatory"],
  ["Pool membership agreement", "Factories ↔ pool SPV", "Signed", "Equity sized to each member's use (2026 Rules), 10% of saving as membership fee, block-by-block allocation", "Pools"],
  ["Certificate issuance and retirement", "CFE Manager ↔ accredited issuer", "Signed", "One certificate per hour per MWh source, retired once, to the buyer", "Evidence"],
  ["Verifier engagement", "Independent verifier ↔ CFE Manager", "Signed", "Read-only ledger access, sampled hours re-performed, monthly opinion", "Governance"],
  ["Surety bond and partner LCs", "Insurer / bank ↔ CFE Manager", "Signed", "Surety covers 50% of guarantee payouts; one month of partner payments under LC at 20% cash margin", "Finance"],
];
export const RISKS = [
  ["Weather (solar/wind below plan)", "CFE Manager (guarantee)", "Portfolio oversizing, battery, top-up, surety for 50% of payouts"],
  ["Partner asset outage", "Partner", "Availability SLAs in PPAs and toll; replacement blocks from exchange"],
  ["Partner cost rises", "Customer (pass-through) / partner", "Fixed 15-yr PPAs; battery toll indexed within a band"],
  ["Pooling blocked in a state", "CFE Manager", "Counsel per state before opening; sell surplus on exchange or as certificates"],
  ["Customer load change", "Customer (with notice)", "Load notice triggers re-plan; extra load priced at all-in rate"],
  ["Evidence failure (meter gap, issuer delay)", "CFE Manager", "Hours stay provisional; never estimated into a claim"],
];

export const CUSTOMER_STAGES = [
  ["Register and verify", "Create the account, verify the company, add the buying team.", "KYC; assign a key account manager.", ["Certificate of incorporation", "GST registration", "Letter of authority"]],
  ["Share meter data", "Connect 12 months of 15-minute meter data (read-only).", "Validate gaps; never touch IT systems.", ["Meter data consent", "Site single-line diagram"]],
  ["Free hourly diagnostic", "Review your true hourly score and cheapest path to 75% and 90%.", "Run the diagnostic (costs us ~₹4 lakh).", ["Diagnostic report"]],
  ["Proposal and term sheet", "Choose a product: Certificates, Night Wrap or CFE Service.", "Size the partner portfolio and price it.", ["Term sheet"]],
  ["Buying-committee diligence", "Sustainability, finance, legal and IT review.", "Answer diligence; share sample certificates.", ["Diligence pack", "Sample certificate"]],
  ["Contract and approvals", "Sign the Master CFE Services Agreement.", "Sign partner PPAs, toll and open access.", ["Signed MSA", "Board approval"]],
  ["Shadow mode", "See your hourly score for 1–3 months with no commitment.", "Run the engine on your real meter data.", ["Shadow report"]],
  ["Live service", "Monthly statement, certificates and guarantee.", "Dispatch every 15 minutes; prove every hour.", []],
];
export const PARTNER_STAGES = [
  ["Register", "Company and asset details.", "KYC; assign a portfolio manager.", ["Company documents"]],
  ["Asset qualification (6 gates)", "Location, connection, metering, attributes, data, lender consent.", "Check each gate; reject assets whose certificates are already sold.", ["Connection agreement", "Meter certificate", "Attribute declaration"]],
  ["Backtest", "Share 12 months of generation data.", "Backtest the asset in the portfolio engine.", ["Generation history"]],
  ["Commercial terms", "Agree PPA or toll terms.", "Price within the cost stack; pass-through clause.", ["Term sheet"]],
  ["Contract signing", "Sign the PPA or toll; LC issued.", "Issue one month of payment security.", ["Signed PPA / toll", "LC"]],
  ["Systems integration", "Connect SCADA / QCA forecasts and meters.", "Test schedules and data feeds.", ["Integration test"]],
  ["Live supply", "Follow schedules; get paid monthly.", "Settle and pass costs through.", []],
];
export const FACTORY_STAGES = [
  ["Register", "Factory details and HT connection.", "KYC; assign a pool manager.", ["HT bill", "Company documents"]],
  ["Load data", "Share 15-minute day-shift load.", "Check fit with the midday surplus.", ["Meter data consent"]],
  ["Savings estimate", "See landed ₹4.1/kWh vs your solar-hour tariff.", "Estimate saving and our 10% fee.", ["Savings report"]],
  ["Pool membership and equity", "Take equity in the pool SPV sized to your use.", "Size equity for the 26% / 51% captive test.", ["Membership agreement", "Equity subscription"]],
  ["Open access approval", "Apply for open access with our help.", "File with the DISCOM and SLDC.", ["OA approval"]],
  ["Live in the pool", "Receive pooled solar block by block.", "Allocate every 15 minutes; bill monthly.", []],
];
export const TRADER_STAGES = [
  ["Empanelment", "Licensed member details.", "Due diligence.", ["Exchange membership"]],
  ["Trading mandate", "Agree limits and order types.", "Sign the mandate.", ["Signed mandate"]],
  ["Systems link", "Connect the order API and confirmations.", "Test orders.", ["API test"]],
  ["Live", "Execute G-DAM top-up and surplus orders.", "Send requests within the mandate.", []],
];
export const VERIFIER_STAGES = [
  ["Appointment", "Independence check and engagement.", "Sign the engagement.", ["Engagement letter"]],
  ["Method review", "Review the evidence method v1.0.", "Answer method questions.", ["Method note"]],
  ["Read-only access", "Access every ledger.", "Provision read-only access.", ["Access log"]],
  ["Monthly review", "Re-perform sampled hours; issue the opinion.", "Fix exceptions before sign-off.", []],
];

export const SEQUENCE = [
  ["D-1 09:30", "Partners", "CFE Manager", "Availability + generation forecasts (solar, wind, battery)"],
  ["D-1 09:40", "Customer + factories", "CFE Manager", "Load forecasts from read-only meters"],
  ["D-1 09:50", "CFE Manager", "internal", "Day-ahead plan: 96 blocks, merit order, pool allocation"],
  ["D-1 10:00", "CFE Manager", "Trading member", "G-DAM top-up bids and surplus sale orders within mandate"],
  ["D-1 13:00", "Exchange", "Trading member", "Cleared blocks"],
  ["D-1 13:05", "Trading member", "CFE Manager", "Trade confirmations (evidence)"],
  ["D-1 14:00", "CFE Manager", "SLDC Gujarat / Maharashtra", "Injection and drawal schedules for campus and pool members"],
  ["D-1 18:00", "SLDC", "CFE Manager", "Schedules accepted"],
  ["D-1 18:10", "CFE Manager", "Battery partner", "Charge 09:00–16:00, discharge from 18:00 (signed plan)"],
  ["D-1 18:15", "Battery partner", "CFE Manager", "Acknowledged"],
  ["Day D", "CFE Manager", "Partners", "Intraday re-plans every 15 minutes when actuals drift"],
  ["D+1 08:00", "Meters", "CFE Manager", "15-minute meter data: generation, campus, factories"],
  ["D+1 09:00", "CFE Manager", "Issuer", "Hourly ledger: matched MWh per source"],
  ["D+1 10:00", "Issuer", "Customer", "Hourly certificates issued and retired"],
  ["Month end", "Verifier", "Customer", "Sampled hours re-performed; monthly opinion"],
];

export const REGS = [
  ["Electricity (Amendment) Rules 2026", "Group captive: 26% ownership, 51% use, tested across the group; each member capped at its ownership share", "Equity in the pool SPV sized to each member's use", "In force"],
  ["Open-access metering", "Consumption metered per consumer in 15-minute blocks", "The engine plans and proves every block", "In force"],
  ["Maharashtra banking (MERC)", "Banked solar usable only in the same slot; hourly slots in draft", "Banking cannot carry midday solar into the night", "Mar 2026; draft Oct 2026"],
  ["CERC trading licence", "Net worth: Cat V ₹2 Cr (≤500 MU) … Cat I ₹50 Cr (>7,000 MU)", "Cat V 2027 → IV 2031 → III 2033 → II 2035 → I 2036", "Met every year"],
  ["SBTi Net-Zero Standard v2 (C32)", "Hourly % per pool >10 GWh, assured; ≥50% to 2030, ≥75% to 2035, ≥90% after", "Creates the demand for an assured hourly number", "From Feb 2027"],
  ["DPDP Act 2023", "Governs processing of personal data", "We read meters only, never IT systems; data stays in India", "In force"],
];

export const JUDGE = [
  { page: "diagnostic", scenario: "normal", title: "1 · The problem", text: "A '100% green' campus buys a year of solar. Run the free diagnostic: hour by hour it is clean only about half the time, and from Feb 2027 that number must be assured." },
  { page: "block", scenario: "normal", title: "2 · The platform", text: "Partners own the solar, wind and batteries. Every 15 minutes our engine fills the campus in merit order, and sells the midday surplus to day-shift factories in the pool." },
  { page: "evidence", scenario: "normal", title: "3 · The proof", text: "Every hour is traced from meter to an issued, retired certificate, and the month is checked by an independent verifier. Below 90%, we pay 2% of the bill per point." },
  { page: "money", scenario: "normal", title: "4 · The money", text: "Of every ₹100 billed, ₹89 passes to partners and we keep ₹11: a ₹563 Cr net-revenue business by 2036 on ₹80 Cr of equity, priced at ₹6.70, ₹0.30 below doing it yourself." },
];

export const TOUR = [
  ["home", "Start screen: one platform, five sides (customer, partner, factory, trading member, verifier) around our engine."],
  ["control", "Control room: live 15-minute dispatch for a 100 MW campus. Drag the time slider or press Run day."],
  ["block", "Block by block: watch one block fill in merit order, and where the midday surplus goes."],
  ["pool", "Pool manager: the upside. Factories buy midday surplus at ₹3.00; a full pool lifts our margin from ₹0.46 to ₹0.70/kWh after the customer rebate."],
  ["evidence", "Evidence: trace one hour from meter to certificate."],
  ["value", "Platform value: same assets and weather, with and without the engine."],
  ["money", "Follow the ₹100: ₹89 to partners, ₹11 kept, five revenue streams."],
  ["network", "Network effect: add factories and watch cost per clean hour fall."],
  ["diagnostic", "Diagnostic tool: the free product that opens every sale."],
  ["feasibility", "Feasibility: size a new customer and check eight state gates."],
  ["guarantee", "Guarantee: 2% of the bill per point below 90%, capped at 10%, half backed by a surety."],
  ["financials", "Financials: ₹80 Cr in two rounds, break-even 2030, ₹352 Cr EBITDA by 2036 (₹186 Cr even without pooling), 300 simulations."],
  ["checks", "System checks: the maths, tested live against the engine."],
];

export const USECASES = [
  { id: "UC1", title: "How one 15-minute block is filled", steps: [["block", "normal", "Midday: solar covers the campus, the battery charges, and the rest goes to the factory pool and the exchange."], ["block", "normal", "Evening: wind and the battery take over; green top-up covers what is left."]] },
  { id: "UC2", title: "Customer onboarding, start to finish", steps: [["portal-customer", "normal", "Eight stages from registration to live service. Approving a stage in the queue unlocks the next."], ["queue", "normal", "Every submission lands in the onboarding queue for review."]] },
  { id: "UC3", title: "A factory joins the pool", steps: [["portal-factory", "normal", "A day-shift factory sees landed ₹4.1/kWh vs its tariff, takes equity sized to its use, and joins."], ["network", "normal", "Each factory that joins lifts pooled volume and every member's margin."]] },
  { id: "UC4", title: "Night shortfall: wind lull, then battery trip", steps: [["control", "windlull", "Wind drops 65% tonight. The engine spreads the battery and buys more green top-up."], ["control", "batttrip", "The battery trips at 22:30. Remaining shortfall goes to top-up, then grid at zero."]] },
  { id: "UC5", title: "Maharashtra blocks pooling", steps: [["value", "poolblock", "Pooling closed: surplus sells at ₹1.50 instead of ₹3.00. The score is unchanged but margin falls."], ["guarantee", "poolblock", "If every state blocked pooling, 2036 EBITDA falls by ₹166 Cr but the core still earns ₹186 Cr; pooling is upside, added where counsel clears it."]] },
  { id: "UC6", title: "Customer adds a 20 MW AI training run", steps: [["control", "aiload", "A load notice triggers a re-plan: battery and top-up cover the extra 20 MW overnight."]] },
  { id: "UC7", title: "Battery charged from the grid", steps: [["evidence", "gridcharge", "Grid charging puts non-clean energy in the battery. The ledger tracks charge source, so that share counts at zero."]] },
  { id: "UC8", title: "A bad week: breach and service credit", steps: [["guarantee", "badweek", "Seven days of weak wind push the month below 90%. We pay 2% of the bill per point; the surety covers half."]] },
  { id: "UC9", title: "A Mumbai colocation asks for CFE90", steps: [["feasibility", "normal", "Size the partner portfolio and check the eight Maharashtra gates before quoting."]] },
  { id: "UC10", title: "Is the maths right?", steps: [["checks", "normal", "Energy balance, battery limits, no double counting and the monthly score, tested live."]] },
];
