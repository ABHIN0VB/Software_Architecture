import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_manual():
    doc = docx.Document()

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette
    PRIMARY = RGBColor(255, 107, 53)    # Orange #FF6B35
    SECONDARY = RGBColor(45, 212, 168) # Teal #2DD4A8
    DARK = RGBColor(18, 18, 26)        # Dark #12121A
    GRAY = RGBColor(90, 90, 105)       # Gray
    WHITE = RGBColor(255, 255, 255)

    def set_cell_background(cell, fill_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    fig_counter = [1]

    def add_figure(img_name, caption):
        img_path = os.path.join("docs", "screenshots", img_name)
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(3)
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=Inches(6.2))
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(14)
            run_cap = p_cap.add_run(f"Figure {fig_counter[0]}: {caption}")
            fig_counter[0] += 1
            run_cap.font.size = Pt(9.5)
            run_cap.font.bold = True
            run_cap.font.color.rgb = RGBColor(80, 80, 95)
        else:
            tbl = doc.add_table(rows=1, cols=1)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = tbl.cell(0, 0)
            set_cell_background(cell, "F3F4F6")
            cell.width = Inches(6.5)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(16)
            run = p.add_run(f"📷 [Figure {fig_counter[0]}: {caption}]")
            fig_counter[0] += 1
            run.bold = True
            run.font.color.rgb = RGBColor(107, 114, 128)
            run.font.size = Pt(10)
            doc.add_paragraph().paragraph_format.space_after = Pt(6)

    def add_h1(text):
        h = doc.add_heading(level=1)
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(6)
        run = h.add_run(text)
        run.font.size = Pt(18)
        run.font.color.rgb = PRIMARY
        run.bold = True
        return h

    def add_h2(text):
        h = doc.add_heading(level=2)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        run = h.add_run(text)
        run.font.size = Pt(13.5)
        run.font.color.rgb = DARK
        run.bold = True
        return h

    def add_h3(text):
        h = doc.add_heading(level=3)
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(2)
        run = h.add_run(text)
        run.font.size = Pt(11)
        run.font.color.rgb = PRIMARY
        run.bold = True
        return h

    def add_p(text, bold_prefix=None, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.size = Pt(10)
        run = p.add_run(text)
        run.font.size = Pt(10)
        run.italic = italic
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.size = Pt(9.5)
        run = p.add_run(text)
        run.font.size = Pt(9.5)
        return p

    # -------------------------------------------------------------
    # 1. TITLE PAGE
    # -------------------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(80)
    title_p.paragraph_format.space_after = Pt(10)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = title_p.add_run("FEASTFLEET")
    r_title.font.size = Pt(38)
    r_title.bold = True
    r_title.font.color.rgb = PRIMARY

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_after = Pt(24)
    r_sub = sub_p.add_run("Next-Generation Food Delivery Platform with Behavioral & Conversational AI\nUSER MANUAL & SYSTEM DEMONSTRATION")
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = GRAY
    r_sub.bold = True

    # Decorative rule
    rule_table = doc.add_table(rows=1, cols=1)
    rule_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rule_cell = rule_table.cell(0, 0)
    set_cell_background(rule_cell, "FF6B35")
    rule_cell.width = Inches(2.5)
    rule_cell.paragraphs[0].paragraph_format.space_before = Pt(2)
    rule_cell.paragraphs[0].paragraph_format.space_after = Pt(2)

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(100)
    meta_p.paragraph_format.space_after = Pt(0)
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    r_m = meta_p.add_run("Software Architecture & Engineering Coursework\n")
    r_m.font.size = Pt(10.5)
    r_m.font.color.rgb = GRAY

    tbl_team = doc.add_table(rows=4, cols=2)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    team_data = [
        ("Course / Subject:", "Software Architecture & Engineering"),
        ("Project Title:", "FeastFleet - AI Food Intelligence Platform"),
        ("Team Members:", "Abhinav Babu & Team"),
        ("Roll Numbers / ID:", "[Insert Roll Numbers Here]")
    ]
    for row_idx, (k, v) in enumerate(team_data):
        c1 = tbl_team.cell(row_idx, 0)
        c2 = tbl_team.cell(row_idx, 1)
        c1.paragraphs[0].add_run(k).bold = True
        c1.paragraphs[0].runs[0].font.size = Pt(10)
        c2.paragraphs[0].add_run(v)
        c2.paragraphs[0].runs[0].font.size = Pt(10)
        c1.width = Inches(2.2)
        c2.width = Inches(3.8)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. INTRODUCTION
    # -------------------------------------------------------------
    add_h1("1. Introduction")
    add_h2("1.1 Brief Description of the Software Product")
    add_p(
        "FeastFleet is an advanced, full-stack online food delivery platform built specifically to tackle modern "
        "recommender fatigue and complex multi-stakeholder dining decisions. Unlike conventional food delivery apps "
        "that merely provide static digital menus and basic keyword search, FeastFleet incorporates a multi-tiered AI suite "
        "featuring a constraint-based Personal Food Agent, an AI Budget Optimizer, long-term Behavioral Food Memory, "
        "a Computer-Vision-inspired Visual Food Search, and an autonomous Group Ordering Solver."
    )
    add_p(
        "Tailored with hyper-local context for Kerala (featuring automated Valavoor, Kottayam geolocation and authentic "
        "menus such as AK Take Away, Pala), FeastFleet delivers an end-to-end purchasing journey from intelligent culinary "
        "exploration and radius-validated cart management to accelerated 5:1 real-time delivery tracking with live rider allocation."
    )

    add_figure("01-splash.png", "FeastFleet Animated Application Splash & Initialization Screen")

    add_h2("1.2 Purpose of the System")
    add_bullet("Solve Recommender Flattening: Avoid repetitive, static suggestions by maintaining active memory of user dining habits and repetition fatigue.", "• ")
    add_bullet("Natural Language Food Ordering: Allow users to state ambiguous or complex dietary and financial constraints (e.g., 'I have ₹250, want something spicy, high protein, but no chicken today') and compute optimal meal matches instantly.", "• ")
    add_bullet("Solve Group Dining Deadlocks: Automatically aggregate multiple individual cravings, dietary rules, and budgets from team members or friends into a single optimal restaurant order with automated per-person payment splits.", "• ")
    add_bullet("Budget Optimization: Provide combinatorial meal solutions (main course + sides + beverages) that mathematically maximize value under strict budget limits while factoring in delivery fees and platform costs.", "• ")
    add_bullet("Transparent Food Intelligence: Enable customers to inspect complete ingredients, preparation methods, and allergen warnings through an AI Ingredient Predictor prior to ordering.", "• ")

    add_figure("02-home.png", "FeastFleet Interactive Home Screen featuring Cravings Categories and Next-Gen AI Food Suite")

    add_h2("1.3 Intended Users")
    add_bullet("Individual Diners & Students: Fast ordering on strict budgets, seeking high-protein or quick meals near Valavoor / Kottayam campuses.", "• ")
    add_bullet("Work Teams & Social Groups: Friends and colleagues who need to order lunch from a single restaurant that satisfies both vegetarian and non-vegetarian requirements without endless debate.", "• ")
    add_bullet("Health-Conscious & Allergy-Prone Diners: Users requiring strict exclusion filters (e.g., zero chicken, gluten-free, dairy-conscious) and ingredient transparency.", "• ")
    add_bullet("Restaurant Partners & Delivery Dispatchers: Outlets seeking unified order dispatching with intelligent proximity and multi-restaurant order bundling.", "• ")

    # -------------------------------------------------------------
    # 3. SYSTEM REQUIREMENTS
    # -------------------------------------------------------------
    add_h1("2. System Requirements")
    add_h2("2.1 Hardware Requirements")
    tbl_hw = doc.add_table(rows=5, cols=3)
    tbl_hw.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Component", "Minimum Requirement", "Recommended Specification"]
    for col_idx, h_text in enumerate(headers):
        cell = tbl_hw.cell(0, col_idx)
        cell.paragraphs[0].add_run(h_text).bold = True
        set_cell_background(cell, "FF6B35")
        cell.paragraphs[0].runs[0].font.color.rgb = WHITE
        cell.paragraphs[0].runs[0].font.size = Pt(9.5)

    hw_rows = [
        ("Processor (CPU)", "Dual-Core 2.0 GHz x64 or ARM", "Intel Core i5 / AMD Ryzen 5 or Apple M-series"),
        ("System Memory (RAM)", "4 GB RAM", "8 GB to 16 GB RAM"),
        ("Storage Space", "1 GB available disk space", "5 GB SSD available space"),
        ("Network", "Standard broadband (1 Mbps)", "High-speed Internet (10+ Mbps broadband/4G/5G)")
    ]
    for row_idx, data in enumerate(hw_rows, start=1):
        for col_idx, val in enumerate(data):
            cell = tbl_hw.cell(row_idx, col_idx)
            cell.paragraphs[0].add_run(val).font.size = Pt(9)
            set_cell_background(cell, "FAFAFA" if row_idx % 2 == 0 else "FFFFFF")

    add_h2("2.2 Software & Runtime Requirements")
    add_bullet("Node.js: Version 18.x or higher (Tested and certified on Node.js v24.x).", "• ")
    add_bullet("Package Manager: npm (v9.x or higher).", "• ")
    add_bullet("Database: MongoDB (v6.0+) OR Embedded MongoDB Memory Server (included out-of-the-box for instant zero-config startup).", "• ")
    add_bullet("Operating System: Microsoft Windows 10/11, macOS (Ventura+), or Linux (Ubuntu 20.04+).", "• ")

    add_h2("2.3 Browser & Platform Requirements")
    add_p(
        "FeastFleet is engineered as a zero-build, responsive web application supporting modern ECMAScript standards, "
        "CSS Grid, Flexbox, and HTML5 Web Storage APIs. Supported browsers include Google Chrome (v100+), Microsoft Edge (v100+), "
        "Mozilla Firefox (v100+), and Apple Safari (v15+)."
    )

    # -------------------------------------------------------------
    # 4. INSTALLATION & SETUP
    # -------------------------------------------------------------
    add_h1("3. Installation & Setup")
    add_h2("3.1 Step-by-Step Installation Instructions")
    add_p("Step 1: Clone or Extract Repository", bold_prefix="1. ")
    add_p("git clone https://github.com/ABHIN0VB/Software_Architecture.git\ncd Software_Architecture/feastfleet", italic=True)
    
    add_p("Step 2: Install Node.js Dependencies", bold_prefix="2. ")
    add_p("npm install", italic=True)

    add_p("Step 3: Launch the FeastFleet Server", bold_prefix="3. ")
    add_p("node server/server.js", italic=True)
    add_p("The server automatically boots an in-memory MongoDB instance if local MongoDB is not running, seeding 9 restaurants and 66 items.")

    add_p("Step 4: Access Application in Web Browser", bold_prefix="4. ")
    add_p("http://localhost:5000", italic=True)

    # -------------------------------------------------------------
    # 5. USER LOGIN & REGISTRATION
    # -------------------------------------------------------------
    add_h1("4. User Login & Registration")
    add_p(
        "FeastFleet features a dual-mode user session architecture. Users may immediately browse restaurants, search menus, "
        "and run all 5 AI features as guests. When placing an order, tracking live history, or personalizing profile insights, "
        "authentication provides persistent synchronization."
    )
    add_h2("4.1 Account Registration")
    add_bullet("Click 'Sign In' at the top-right corner of the navbar.", "1. ")
    add_bullet("Select 'Create an Account' tab on login.html.", "2. ")
    add_bullet("Enter Full Name, Email Address, 10-digit Phone Number, and Password.", "3. ")
    add_bullet("Click 'Sign Up'. The system securely encrypts passwords via bcrypt and sets JWT token in localStorage.", "4. ")

    add_figure("04-register.png", "User Registration Interface with Validation Fields - login.html")

    add_h2("4.2 User Login & Profile Dropdown")
    add_bullet("Navigate to login.html with the 'Sign In' tab active.", "1. ")
    add_bullet("Enter your registered Email Address and Password.", "2. ")
    add_bullet("Click 'Sign In'. Your user avatar with initials will appear in the top-right navbar.", "3. ")
    add_bullet("Click the avatar to reveal the Profile Menu with links to Order History, Live Tracking, Cart, and Log Out.", "4. ")

    add_figure("03-login.png", "User Login Interface - login.html")
    add_figure("05-login-error.png", "Form Validation & Error Notification on Invalid Credentials")
    add_figure("06-home-logged-in.png", "Homepage in Authenticated User State with Profile Avatar in Navbar")
    add_figure("07-profile-menu.png", "Interactive User Profile Dropdown Menu")

    # -------------------------------------------------------------
    # 6. SYSTEM FEATURES & FUNCTIONALITIES
    # -------------------------------------------------------------
    add_h1("5. System Features & Functionalities")

    add_h2("5.1 Multi-Restaurant Catalog & Hyper-Local Geolocation")
    add_p(
        "FeastFleet features an interactive restaurant directory with real-time distance calculations, estimated delivery times, "
        "and cuisine category filtering. It features a hardcoded hyper-local detection for Valavoor, Kottayam (9.7360° N, 76.6570° E), "
        "placing AK Take Away, Pala (4.1 km away, 30-35 min delivery) at the top of recommendations."
    )
    add_figure("08-restaurants.png", "Restaurant Directory Screen with Active 'Valavoor, Kottayam' Geolocation Badge")
    add_figure("09-menu-ak.png", "AK Take Away Pala Dedicated Menu Screen with Category Tabs and Dish Cards")

    add_h2("5.2 🤖 Feature 1: Personal Food Agent (ai-agent.html)")
    add_p(
        "The Personal Food Agent is an autonomous culinary assistant that parses complex human constraints, eliminates "
        "unwanted ingredients, balances caloric/protein goals, and identifies the best matching meal within an exact budget."
    )
    add_p("Step-by-Step Operation:", bold_prefix="Workflow: ")
    add_bullet("Open ai-agent.html from the top navbar or homepage AI Suite.", "1. ")
    add_bullet("Set your target budget using the interactive slider (range: ₹80 to ₹800).", "2. ")
    add_bullet("Select mood/flavor chips: 🌶️ Spicy, 🥛 Creamy, 🔥 Grilled, 🍟 Crispy, 🥗 Light, etc.", "3. ")
    add_bullet("Choose dietary preference (Any, Vegetarian Only, Non-Vegetarian Only).", "4. ")
    add_bullet("Toggle '💪 High Protein' if seeking fitness/gym meals.", "5. ")
    add_bullet("Select strict exclusions (tap '🐔 Chicken' to avoid chicken, or beef, fish, paneer, egg).", "6. ")
    add_bullet("Click '🤖 Find My Perfect Food'.", "7. ")
    add_bullet("The AI displays a step-by-step reasoning trace, filters all 66 items, computes food price + delivery fee, and highlights the '⭐ BEST MATCH'.", "8. ")
    add_bullet("Click '🛒 Add to Cart' directly on the recommendation card to stage the meal into the cart.", "9. ")
    
    add_figure("14-ai-agent.html.png" if os.path.exists("docs/screenshots/14-ai-agent.html.png") else "14-ai-agent.png", "Personal Food Agent Screen with Budget Slider, Flavor Chips, and Reasoning Trace")

    add_h2("5.3 💰 Feature 2: AI Food Budget Optimizer (budget-optimizer.html)")
    add_p(
        "A combinatorial optimization engine that solves dining constraints for groups of 1 to 10 people. It computes "
        "food subtotals, restaurant delivery fees, and platform fees (5%) to maximize savings under a specified budget ceiling."
    )
    add_p("Step-by-Step Operation:", bold_prefix="Workflow: ")
    add_bullet("Navigate to budget-optimizer.html.", "1. ")
    add_bullet("Set total group budget slider (e.g., ₹500) and select headcount with +/- buttons (e.g., 4 people).", "2. ")
    add_bullet("Choose preferred cuisine (Any, Indian, Chinese, Italian, Biryani, etc.).", "3. ")
    add_bullet("Select meal structure checkboxes: Main Course, Side Dish, Drink, Dessert.", "4. ")
    add_bullet("Click '💰 Optimize My Budget'.", "5. ")
    add_bullet("The algorithm evaluates all restaurants, builds the cheapest valid combo per person, and outputs ranked comparison cards showing Food Subtotal, Delivery Fee, Platform Fee, Total, and Per-Person Split.", "6. ")
    add_bullet("Click '🛒 Add Entire Combo for N People' to push the entire group combo directly to the cart with one click.", "7. ")
    
    add_figure("15-budget-optimizer.png", "AI Budget Optimizer with Combinatorial Meal Combos and Per-Person Split Table")

    add_h2("5.4 🧠 Feature 3: AI Food Memory & Habit Profiling (food-profile.html)")
    add_p(
        "Addresses 'recommender flattening' by tracking historical orders across dimensions such as time-of-day, day-of-week, "
        "favorite cuisines, average spend, and repetition fatigue."
    )
    add_p("Step-by-Step Operation:", bold_prefix="Workflow: ")
    add_bullet("Navigate to food-profile.html or ask the chatbot 'My Food Profile'.", "1. ")
    add_bullet("View dynamic analytics: Total Items Ordered, Weekly Orders, Avg Spend per Item, Peak Order Time, and Favorite Restaurant.", "2. ")
    add_bullet("Repetition Fatigue Detection: If you order the same dish (e.g., Biryani) 2+ times in 7 days, an alert banner warns: 'You've had Chicken Biryani 3 times this week. Want something different?'", "3. ")
    add_bullet("Diet Balance: An interactive SVG pie chart visualizes your Vegetarian vs. Non-Vegetarian consumption ratio.", "4. ")
    add_bullet("Category Frequency: Progress bars show consumption breakdown across Biryani, Curries, Breads, and Shakes.", "5. ")
    add_bullet("Weekly Activity Timeline: Day dots indicate order activity from Sunday through Saturday.", "6. ")
    add_bullet("Click 'Load Demo Profile' to immediately preview active behavioral data with one click.", "7. ")

    add_figure("16-food-profile.png", "AI Food Memory Dashboard with Diet Balance Pie Chart, Habit Tracker, and Repetition Fatigue Alert")

    add_h2("5.5 📷 Feature 4: Visual Food Search (See Food → Find Food → Order, visual-search.html)")
    add_p(
        "Enables users to discover dishes using imagery or visual descriptors. The engine applies semantic category matching "
        "and color-hint heuristics to match visual inputs against restaurant inventory."
    )
    add_p("Step-by-Step Operation:", bold_prefix="Workflow: ")
    add_bullet("Open visual-search.html.", "1. ")
    add_bullet("Drag and drop a food image into the upload box (or click to select a photo file).", "2. ")
    add_bullet("Alternatively, select a visual category card (🍗 Grilled/Tandoori, 🍚 Biryani/Rice, 🍔 Burger, 🍜 Noodles, 🍕 Pizza, 🍛 Curry, 🍰 Dessert, 🥤 Shake).", "3. ")
    add_bullet("Optionally select a dominant color chip (Red, Orange, Yellow, Green, Brown, White) to refine flavor matching.", "4. ")
    add_bullet("Click '📷 Find This Dish Near Me'.", "5. ")
    add_bullet("View ranked matches tagged with '🎯 Closest Match', restaurant ratings, delivery fees, and an instant '🛒 Add to Cart' button.", "6. ")

    add_figure("17-visual-search.png", "Visual Food Search with Drag-and-Drop Photo Uploader and Category Chips")

    add_h2("5.6 👥 Feature 5: AI Group Ordering Agent (group-order.html)")
    add_p(
        "A multi-constraint team dining coordinator that allows group members (e.g., Rahul, Anu, Akhil) to register "
        "their individual cravings, dietary rules (veg/non-veg), and personal budgets. The optimizer determines the single "
        "best restaurant that satisfies everyone, assigns dishes, and calculates the exact per-person bill split."
    )
    add_p("Step-by-Step Operation:", bold_prefix="Workflow: ")
    add_bullet("Navigate to group-order.html.", "1. ")
    add_bullet("Set Total Group Budget (e.g., ₹800) and Max Delivery Time (e.g., 35 minutes).", "2. ")
    add_bullet("Add or modify group members (e.g., Rahul: biryani, non-veg; Anu: paneer, vegetarian; Akhil: chicken noodles).", "3. ")
    add_bullet("Click '🤖 Find Best Restaurant for Group'.", "4. ")
    add_bullet("The AI checks menu overlap, eliminates restaurants lacking vegetarian dishes for veg members, and displays the winning restaurant.", "5. ")
    add_bullet("Dish Assignments: Displays each member's assigned dish with prices.", "6. ")
    add_bullet("Click '🛒 Add All Dishes to Cart' to add all items labeled with member names (e.g., 'Paneer Butter Masala (Anu)') directly into the cart.", "7. ")

    add_figure("18-group-order.png", "AI Group Ordering Agent Interface with Multi-Member Dietary Solver")

    add_h2("5.7 AI Ingredient Predictor & Recipe Explainer Modal")
    add_p(
        "Available directly on all menu cards across restaurants. Clicking '✨ AI Ingredients' on any dish card opens "
        "an AI modal detailing the complete culinary recipe, key spices, fresh ingredients, allergen warnings (nuts, dairy, gluten), "
        "flavor profiles, and estimated preparation time."
    )
    add_figure("10-ai-ingredients.png", "AI Ingredient Predictor & Allergen Explainer Modal")
    add_figure("10b-item-added.png", "Real-Time Cart Staging Notification with Floating Cart Counter")

    add_h2("5.8 Floating Conversational AI Chatbot Widget (FeastBot)")
    add_p(
        "Available on every page in the bottom-right corner. It supports natural text input as well as one-tap quick action buttons "
        "linking to Track Order, Food Agent, Budget Optimizer, Food Profile, Visual Search, and Group Order. Users can type natural queries "
        "like 'I'm hungry, ₹250, spicy, no chicken' and receive rich interactive cards with direct '[+ Cart]' buttons inside the chat."
    )
    add_figure("20-chatbot.png", "FeastBot Floating AI Chatbot Widget with Proactive Food Intelligence and Quick Buttons")

    add_h2("5.9 Multi-Restaurant Cart with 1km Radius Rule & 5:1 Tracking")
    add_p(
        "FeastFleet allows bundling dishes from different restaurants into a single cart, provided all restaurants are within "
        "a 1.0 km radius of each other (calculated via the Haversine formula). If a user attempts to add an item from a restaurant too far away, "
        "a clear warning toast prevents order conflict."
    )
    add_figure("11-cart.png", "Shopping Cart Page with Inter-Restaurant Radius Verification and Order Summary")

    add_p(
        "Upon checkout, the user is redirected to tracking.html. FeastFleet employs an accelerated 5:1 real-time delivery simulator: "
        "a 25-minute delivery finishes in 5 real minutes. A randomized Kerala delivery partner (Arjun, Rahul, Aditya, Karthik, etc.) "
        "is allocated with live contact info, and status transitions through Order Placed → Confirmed → Preparing Food → Out for Delivery → Delivered."
    )
    add_figure("12-tracking.png", "Real-Time Order Tracking Page with 5:1 Speed Clock and Assigned Delivery Partner")
    add_figure("13-orders.png", "User Order History Screen - orders.html")
    add_figure("19-contact.png", "Help, Contact & Support Screen - contact.html")

    # -------------------------------------------------------------
    # 7. NAVIGATION
    # -------------------------------------------------------------
    add_h1("6. System Navigation")
    add_p("The FeastFleet platform provides an intuitive, interconnected navigation hierarchy:")
    
    tbl_nav = doc.add_table(rows=8, cols=3)
    tbl_nav.alignment = WD_TABLE_ALIGNMENT.CENTER
    nav_headers = ["Screen / Module", "File / Route", "Primary Function & Navigation Pathways"]
    for col_idx, h_text in enumerate(nav_headers):
        cell = tbl_nav.cell(0, col_idx)
        cell.paragraphs[0].add_run(h_text).bold = True
        set_cell_background(cell, "FF6B35")
        cell.paragraphs[0].runs[0].font.color.rgb = WHITE
        cell.paragraphs[0].runs[0].font.size = Pt(9.5)

    nav_data = [
        ("Home Page", "index.html", "Hero banner, Category grid, Next-Gen AI Suite cards, Featured restaurants, Search bar."),
        ("Restaurant Directory", "restaurants.html", "Browse all 9 restaurants, filter by cuisine, Geolocation detect ('Valavoor, Kottayam')."),
        ("Dedicated Menus", "menu-aktakeaway.html, menu.html", "Category tabs, food cards, Add-to-Cart buttons, AI Ingredient Predictor modals."),
        ("Personal Food Agent", "ai-agent.html", "Autonomous constraint solver, reasoning trace, 1-click cart insertion."),
        ("Budget Optimizer", "budget-optimizer.html", "Combinatorial group meal optimizer, per-person split calculator, combo checkout."),
        ("Food Memory", "food-profile.html", "Behavioral analytics dashboard, diet balance, weekly timeline, repetition alerts."),
        ("Visual Search & Group", "visual-search.html, group-order.html", "Photo/category search and multi-user collaborative dining optimizer."),
    ]
    for row_idx, data in enumerate(nav_data, start=1):
        for col_idx, val in enumerate(data):
            cell = tbl_nav.cell(row_idx, col_idx)
            cell.paragraphs[0].add_run(val).font.size = Pt(9)
            set_cell_background(cell, "FAFAFA" if row_idx % 2 == 0 else "FFFFFF")

    # -------------------------------------------------------------
    # 8. INPUT AND OUTPUT SPECIFICATIONS
    # -------------------------------------------------------------
    add_h1("7. Input and Output Specifications")
    
    tbl_io = doc.add_table(rows=7, cols=3)
    tbl_io.alignment = WD_TABLE_ALIGNMENT.CENTER
    io_headers = ["Module", "User Inputs", "System Output & Response"]
    for col_idx, h_text in enumerate(io_headers):
        cell = tbl_io.cell(0, col_idx)
        cell.paragraphs[0].add_run(h_text).bold = True
        set_cell_background(cell, "FF6B35")
        cell.paragraphs[0].runs[0].font.color.rgb = WHITE
        cell.paragraphs[0].runs[0].font.size = Pt(9.5)

    io_data = [
        ("Food Agent", "Budget slider (₹), mood chips, dietary select, protein toggle, exclusion chips.", "Reasoning trace, filtered dishes, total price with delivery fee, budget badge, Cart button."),
        ("Budget Optimizer", "Budget (₹), Headcount (1-10), Cuisine dropdown, Meal structure checkboxes.", "Ranked restaurant combos, per-person breakdown, food/delivery/platform fee breakdown, group savings."),
        ("Food Memory", "Historical order records (auto-collected via cart checkout).", "Analytics cards, favorite dishes leaderboard, SVG diet balance pie, weekly activity dots, fatigue alerts."),
        ("Visual Search", "Image file (JPG/PNG), dish category chip, color chip, or text query.", "Expanded semantic search terms, top restaurant matches with photos, prices, ratings, and cart button."),
        ("Group Order", "Group budget (₹), max delivery (min), member names, cravings, dietary rules, exclusions.", "Winning single restaurant, personalized dish assignment per person, total cost, per-person split."),
        ("Order Tracking", "Order checkout action from cart.html.", "Order ID (#FF-XXXX), status pipeline, delivery partner name & phone, real-time 5:1 countdown clock.")
    ]
    for row_idx, data in enumerate(io_data, start=1):
        for col_idx, val in enumerate(data):
            cell = tbl_io.cell(row_idx, col_idx)
            cell.paragraphs[0].add_run(val).font.size = Pt(9)
            set_cell_background(cell, "FAFAFA" if row_idx % 2 == 0 else "FFFFFF")

    # -------------------------------------------------------------
    # 9. ERROR HANDLING & MESSAGES
    # -------------------------------------------------------------
    add_h1("8. Error Handling & System Messages")
    add_bullet("1. Restaurant Radius Violation: '⚠️ [Restaurant B] is X km from [Restaurant A]. Must be within 1.0 km!' → Occurs when trying to bundle orders from restaurants located too far apart. Resolved by clearing cart or ordering from nearby outlets.", "• ")
    add_bullet("2. Over-Budget Optimization: 'No combinations found within ₹[Budget]' → Occurs when budget is insufficient for selected headcount and meal structure. Resolved by increasing the budget slider or selecting fewer courses.", "• ")
    add_bullet("3. Strict Exclusion Deadlock: 'No matches found for your constraints' → Occurs when conflicting constraints (e.g. vegetarian + high-protein + exclude paneer + exclude dal) leave zero candidates. Resolved by relaxing one exclusion chip.", "• ")
    add_bullet("4. Empty Cart Checkout: 'Your cart is empty' → Checkout button is disabled until at least one item is added.", "• ")
    add_bullet("5. Server Disconnect: 'Cannot reach server. Start it with node server/server.js' → Clear visual prompt guiding user to verify the backend process.", "• ")

    # -------------------------------------------------------------
    # 10. LOGOUT & EXIT PROCEDURES
    # -------------------------------------------------------------
    add_h1("9. Logout & Exit Procedures")
    add_bullet("1. Click your User Profile Avatar located at the top-right of the navigation bar.", "• ")
    add_bullet("2. From the dropdown menu, select 'Log Out'.", "• ")
    add_bullet("3. The system clears the JWT authentication token from localStorage, resets user state, updates the navbar to 'Sign In', and redirects safely to the homepage (index.html).", "• ")
    add_bullet("4. Active orders and cart items remain preserved in local storage for continuous guest usability.", "• ")

    # -------------------------------------------------------------
    # 11. TROUBLESHOOTING & FAQ
    # -------------------------------------------------------------
    add_h1("10. Troubleshooting & Frequently Asked Questions (FAQ)")
    
    add_h3("Q1: What if port 5000 is already in use by another application?")
    add_p("A: You can change the port in server/server.js by setting the PORT variable (e.g., const PORT = process.env.PORT || 5001) or terminate the conflicting process via Task Manager.")

    add_h3("Q2: Does FeastFleet require an internet connection to run?")
    add_p("A: The backend, AI services, database, and all business logic run 100% locally on localhost:5000 with zero cloud dependency. An active internet connection is only needed to load CDN icons (Bootstrap Icons) and Unsplash food images.")

    add_h3("Q3: How does the in-memory database work if I don't have MongoDB installed?")
    add_p("A: FeastFleet includes 'mongodb-memory-server'. If local MongoDB on port 27017 is not found, the server spins up an isolated, in-memory MongoDB instance automatically and seeds all 9 restaurants and 66 dishes instantly.")

    add_h3("Q4: How does the 5:1 delivery tracking work?")
    add_p("A: Delivery tracking maps 1 real-world minute to 5 simulated app minutes. A 25-minute delivery will progress from 'Order Placed' to 'Delivered 🎉' in exactly 5 real minutes, allowing seamless demonstration of the full delivery lifecycle.")

    add_h3("Q5: How do I test the Food Memory feature if I am running the app for the first time?")
    add_p("A: Navigate to food-profile.html and click the purple 'Load Demo Profile' button. It will instantly inject a realistic 12-order history, rendering the complete analytics dashboard, repetition warnings, and pie charts immediately.")

    # Save document
    doc.save("FEASTFLEET_USER_MANUAL.docx")
    print("Successfully generated FEASTFLEET_USER_MANUAL.docx with all screenshots embedded!")

if __name__ == "__main__":
    create_manual()
