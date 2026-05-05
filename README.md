## Installation & Run Guide

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "path/to/project/Data Science"
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   # Windows CMD
   .\venv\Scripts\activate.bat
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

5. Open the app in browser:
   - `http://localhost:5000`

### Notes
- Ensure `Extended_Employee_Performance_and_Productivity_Data.csv` is in the repo root.
- Use another port if 5000 is occupied (edit `app.py` host/port).  