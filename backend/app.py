from pathlib import Path
from flask import Flask, jsonify, request
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / 'Extended_Employee_Performance_and_Productivity_Data.csv'

app = Flask(__name__, static_folder=str(BASE_DIR / 'frontend'), static_url_path='')

# Load once at startup
try:
    df = pd.read_csv(CSV_PATH)
except FileNotFoundError:
    raise FileNotFoundError(f'CSV not found at {CSV_PATH}')

# Keep only numeric columns we care about
NUMERIC_COLUMNS = ['Performance_Score', 'Monthly_Salary', 'Work_Hours_Per_Week', 'Overtime_Hours', 'Sick_Days']

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/summary')
def summary():
    stats = {}
    stats['total_rows'] = int(df.shape[0])
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            colnum = pd.to_numeric(df[col], errors='coerce').fillna(0)
            stats[col] = {
                'mean': float(colnum.mean()),
                'min': float(colnum.min()),
                'max': float(colnum.max()),
                'std': float(colnum.std()),
            }
    return jsonify(stats)

@app.route('/api/top')
def top_performers():
    n = request.args.get('n', 10, type=int)
    if 'Performance_Score' not in df.columns:
        return jsonify([])
    capped = min(max(n,1), 100)
    top = df.sort_values('Performance_Score', ascending=False).head(capped)
    keys = ['Employee_ID', 'Employee_Name'] if 'Employee_Name' in df.columns else ['Employee_ID']
    keys = [k for k in keys if k in df.columns] + ['Performance_Score', 'Monthly_Salary', 'Department']
    keys = [k for k in keys if k in df.columns]
    return jsonify(top[keys].to_dict(orient='records'))

@app.route('/api/employees')
def employees():
    limit = request.args.get('limit', 100, type=int)
    limit = min(max(limit, 1), 1000)
    subset = df.head(limit)
    return jsonify(subset.fillna('').to_dict(orient='records'))

@app.route('/api/before')
def before_evaluation():
    limit = request.args.get('limit', 50, type=int)
    limit = min(max(limit, 1), 200)
    # Show basic employee info without performance metrics
    basic_cols = ['Employee_ID', 'Department', 'Gender', 'Age', 'Job_Title', 'Hire_Date', 'Years_At_Company', 'Education_Level', 'Monthly_Salary']
    available_cols = [col for col in basic_cols if col in df.columns]
    subset = df[available_cols].head(limit)
    return jsonify(subset.fillna('').to_dict(orient='records'))

@app.route('/api/after')
def after_evaluation():
    limit = request.args.get('limit', 50, type=int)
    limit = min(max(limit, 1), 200)
    # Show complete data with performance evaluation metrics
    evaluation_cols = ['Employee_ID', 'Department', 'Job_Title', 'Performance_Score', 'Monthly_Salary', 'Work_Hours_Per_Week', 'Overtime_Hours', 'Sick_Days', 'Employee_Satisfaction_Score', 'Years_At_Company']
    available_cols = [col for col in evaluation_cols if col in df.columns]
    subset = df[available_cols].head(limit)
    return jsonify(subset.fillna('').to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
