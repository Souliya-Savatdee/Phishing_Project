from pathlib import Path

def file_path_excel(cam_name):
    base_dir = Path(__file__).resolve().parent.parent  
    directory = base_dir / 'result'
    excel_file = f"{cam_name}_result.xlsx"
    file_path = directory / excel_file
    return file_path
    