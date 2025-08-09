import re
import json

def convert_markdown_to_json(markdown_file_path, json_file_path):
    """
    Parses a markdown file with job descriptions and converts it into a JSON file,
    handling entries with and without known salaries.

    Args:
        markdown_file_path (str): The path to the input markdown file to be read.
        json_file_path (str): The path to the output JSON file to be created/overwritten.
    """
    print(f"Reading data from: {markdown_file_path}")
    try:
        with open(markdown_file_path, 'r', encoding='utf-8') as f:
            markdown_text = f.read()
    except FileNotFoundError:
        print(f"FATAL ERROR: The input file was not found at '{markdown_file_path}'.")
        print("Please make sure the file exists in the same directory as the script, or provide the full path.")
        return # Stop the script if the file doesn't exist

    # This regular expression is designed to find all job entries.
    # It handles two cases for the salary line:
    # 1. A line with a numeric salary (e.g., "השכר הממוצע בתחום: 11,480 ₪")
    # 2. A line stating the salary is unknown (e.g., "שכר לא ידוע")
    regex = re.compile(
        r'\[\s*\n\n'
        r'(?P<title>.+?)\n\n'
        r'(?P<description>.+?)\n\n'
        r'-\s*שייך לתחום:\s*(?P<field>.+?)\n'
        r'-\s*(?:השכר הממוצע בתחום:\s*(?P<salary>[\d,]+)\s*₪|(?P<unknown_salary>שכר לא ידוע))'
        r'\n\n\s*\]\((?P<url>.+?)\)',
        re.S # re.S (or re.DOTALL) allows '.' to match newlines, which is crucial for the description
    )

    jobs = []
    # finditer finds all matches and processes them one by one
    for match in regex.finditer(markdown_text):
        job_data = match.groupdict()

        # Check if the 'salary' group was found. If not, the salary must be "unknown".
        salary_value = job_data.get('salary')
        if salary_value:
            # Format the salary with the currency symbol
            final_salary = f"₪{salary_value.strip()}"
        else:
            # Use the "unknown salary" text as the value
            final_salary = "שכר לא ידוע"

        # Append the cleaned-up data to our list
        jobs.append({
            "title": job_data['title'].strip(),
            "description": job_data['description'].strip(),
            "field": job_data['field'].strip(),
            "salary": final_salary
        })

    print(f"Found and processed {len(jobs)} job entries.")
    print(f"Writing JSON output to: {json_file_path}")

    # Write the 'jobs' list to the specified JSON output file
    with open(json_file_path, 'w', encoding='utf-8') as f:
        # ensure_ascii=False is vital for correctly writing non-English characters (like Hebrew)
        # indent=4 makes the JSON file readable for humans
        json.dump(jobs, f, ensure_ascii=False, indent=4)

    print("Conversion complete.")

# This is the main execution block that runs when you start the script.
# It has been corrected to ONLY read the input file and not overwrite it.
if __name__ == '__main__':
    # --- Configuration ---
    # Define the name of your input markdown file
    input_filename = "data.md"
    
    # Define the name of the output JSON file that will be created
    output_filename = "data.json"
    # --- End of Configuration ---

    # Call the main function to perform the conversion
    convert_markdown_to_json(input_filename, output_filename)