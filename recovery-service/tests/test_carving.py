import os
import pytest
from unittest.mock import patch, MagicMock
from engines.carving import CATCHCarving

@patch("engines.carving.subprocess.run")
@patch("engines.carving.os.path.exists")
@patch("engines.carving.os.makedirs")
@patch("engines.carving.os.walk")
@patch("engines.carving.os.path.getsize")
def test_carving_engine_dummy(mock_getsize, mock_walk, mock_makedirs, mock_exists, mock_run):
    # Mocking os.path.exists to return True
    mock_exists.return_value = True
    
    # Mocking subprocess.run to return a successful result
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_result.stdout = "Success"
    mock_result.stderr = ""
    mock_run.return_value = mock_result
    
    # Mocking os.walk to return dummy recovered files
    mock_walk.return_value = [
        ("carved_files", [], ["file1.txt", "file2.jpg"])
    ]
    
    # Mocking file size
    mock_getsize.return_value = 1024
    
    engine = CATCHCarving()
    result = engine.execute("dummy_image.dd", output_dir="dummy_output")
    
    assert result["engine"] == "carving"
    assert result["status"] == "SUCCESS"
    assert result["files_found"] == 2
    assert len(result["files"]) == 2
    assert result["files"][0]["name"] == "file1.txt"
    assert result["files"][1]["name"] == "file2.jpg"
